"use client";

/**
 * The CFD 3D viewer: a React port of the control plane's cfd_viewer.js.
 *
 * WHY A PORT, NOT AN IFRAME. control.coreframecloud.com sends
 * X-Frame-Options: DENY and frame-ancestors 'none', so the API's viewer cannot
 * be framed by www. The GLB itself is a plain CORS fetch (www is in the API's
 * allow-list), and three.js is already a site dependency (the homepage scene).
 * three is imported inside the effect, so it is only downloaded on a job page
 * that has something to show.
 *
 * Same behaviour as the API page: orbit/zoom, opens framed on the walls, field
 * toggles and a colour legend read from the GLB's scene extras; a geometry
 * preview colours the openings by role (inlet green, outlet orange).
 */
import { useEffect, useRef, useState } from "react";
import type * as T from "three";
import { fmtNumber, sessionToken } from "@/lib/cfd-job";

type Field = { node: string; label: string; unit: string; min: number; max: number; colormap: string[] };
type CapInfo = { id: string; role: string | null; area: string };

const FIELD_NAMES: Record<string, string> = {
  pressure: "Wall pressure",
  velocity: "Velocity slice",
  streamlines: "Streamlines",
};

export default function JobViewer({
  url,
  caps,
  show,
  label,
}: {
  url: string;
  caps?: CapInfo[];
  show?: string[];
  label: string;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [fields, setFields] = useState<Record<string, Field>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [legendKey, setLegendKey] = useState<string | null>(null);
  const toggleRef = useRef<(key: string) => void>(() => {});
  const capsKey = JSON.stringify(caps ?? []);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let stopped = false;
    let cleanup = () => {};
    (async () => {
      const THREE = await import("three");
      const { GLTFLoader } = await import("three/examples/jsm/loaders/GLTFLoader.js");
      const { OrbitControls } = await import("three/examples/jsm/controls/OrbitControls.js");
      if (stopped) return;
      const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      el.prepend(renderer.domElement);
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x0f1115);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.6));
      const sun = new THREE.DirectionalLight(0xffffff, 1.2);
      sun.position.set(1, 2, 3);
      scene.add(sun);
      const camera = new THREE.PerspectiveCamera(45, 1, 0.001, 1e5);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      const resize = () => {
        const w = el.clientWidth;
        const h = el.clientHeight;
        renderer.setSize(w, h, false);
        camera.aspect = w / Math.max(1, h);
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();

      let raf = 0;
      const loop = () => {
        controls.update();
        renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
      };
      loop();
      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        controls.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };

      const loader = new GLTFLoader();
      // File URLs are signed 5-minute links (sig=); an unsigned one is opened by the bearer.
      const bearer = /[?&](?:sig|token)=/.test(url) ? null : sessionToken();
      if (bearer) loader.setRequestHeader({ Authorization: `Bearer ${bearer}` });
      loader.load(
        url,
        (gltf) => {
          if (stopped) return;
          const root = gltf.scene;
          root.traverse((o) => {
            const m = o as T.Mesh;
            if (!(m.isMesh || (o as T.Line).isLine)) return;
            const g = m.geometry as T.BufferGeometry;
            if (g.getAttribute("color")) {
              if (m.isMesh) {
                m.material = new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide });
              } else {
                const mat = m.material as T.LineBasicMaterial;
                mat.vertexColors = true;
                mat.color?.set(0xffffff);
              }
            }
            if (m.isMesh && !g.getAttribute("normal")) g.computeVertexNormals();
          });
          scene.add(root);

          // Open framed on the walls (not the streamlines or the slice, which reach further).
          const geom = root.getObjectByName("walls_pressure") || root.getObjectByName("walls") || root;
          const sphere = new THREE.Box3().setFromObject(geom).getBoundingSphere(new THREE.Sphere());
          const r = sphere.radius || 1;
          const fov = (camera.fov * Math.PI) / 180;
          const dist = (r / Math.sin(Math.min(fov, fov * camera.aspect) / 2)) * 1.08;
          const dir = new THREE.Vector3(0.55, 0.45, 0.7).normalize();
          camera.position.copy(sphere.center).addScaledVector(dir, dist);
          camera.near = dist / 1000;
          camera.far = dist * 100;
          camera.updateProjectionMatrix();
          controls.target.copy(sphere.center);
          controls.update();

          const extras = (gltf.scenes[0]?.userData ?? {}) as { fields?: Record<string, Field> };
          const fs = extras.fields ?? {};
          const names = Object.keys(fs);
          const want = show && show.length ? show : names;
          const vis: Record<string, boolean> = {};
          names.forEach((k) => {
            const node = root.getObjectByName(fs[k].node);
            if (node) node.visible = want.includes(k);
            vis[k] = !!node && node.visible;
          });
          toggleRef.current = (key: string) => {
            const node = root.getObjectByName(fs[key]?.node ?? "");
            if (!node) return;
            node.visible = !node.visible;
            setVisible((v) => ({ ...v, [key]: node.visible }));
            if (node.visible) setLegendKey(key);
          };
          if (!names.length && caps?.length) {
            caps.forEach((cap) => {
              const node = root.getObjectByName(`cap_${cap.id}`) as T.Mesh | undefined;
              if (node) {
                node.material = new THREE.MeshBasicMaterial({
                  color: cap.role === "inlet" ? 0x2fbf5a : 0xf0883e,
                  side: THREE.DoubleSide,
                });
              }
            });
          }
          setFields(fs);
          setVisible(vis);
          setLegendKey(names.find((k) => want.includes(k)) ?? names[0] ?? null);
          setState("ready");
        },
        undefined,
        () => !stopped && setState("error"),
      );
    })().catch(() => !stopped && setState("error"));
    return () => {
      stopped = true;
      cleanup();
    };
    // capsKey stands in for caps (a new array each render).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, capsKey]);

  const legend = legendKey ? fields[legendKey] : null;
  const names = Object.keys(fields);

  return (
    <div
      ref={box}
      className="relative h-[300px] overflow-hidden rounded-[20px] bg-night sm:h-[420px]"
      role="img"
      aria-label={label}
    >
      {state === "loading" ? (
        <p className="absolute inset-0 grid place-items-center text-[13px] text-white/60">Loading the 3D view…</p>
      ) : null}
      {state === "error" ? (
        <p className="absolute inset-0 grid place-items-center px-6 text-center text-[13px] text-white/70">
          The 3D view could not be loaded. The PDF report has the same pictures.
        </p>
      ) : null}
      {names.length ? (
        <div className="absolute top-3 right-3 flex flex-wrap justify-end gap-1.5">
          {names.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => toggleRef.current(k)}
              aria-pressed={!!visible[k]}
              className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                visible[k] ? "bg-white text-ink" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              {FIELD_NAMES[k] ?? k}
            </button>
          ))}
        </div>
      ) : null}
      {legend ? (
        <div className="absolute bottom-3 left-3 rounded-xl bg-black/60 px-3 py-2 text-[12px] text-white backdrop-blur">
          <div>{legend.label}</div>
          <div
            className="my-1 h-2.5 w-[180px] rounded"
            style={{ background: `linear-gradient(to right, ${legend.colormap.join(",")})` }}
          />
          <div className="font-mono text-[11px] text-white/80">
            {fmtNumber(legend.min)} … {fmtNumber(legend.max)} {legend.unit}
          </div>
        </div>
      ) : null}
      {!names.length && caps?.length && state === "ready" ? (
        <div className="absolute bottom-3 left-3 rounded-xl bg-black/60 px-3 py-2 text-[12px] backdrop-blur">
          <div className="text-white">Openings</div>
          {caps.map((c) => (
            <div key={c.id} style={{ color: c.role === "inlet" ? "#2fbf5a" : "#f0883e" }}>
              {c.role === "inlet" ? "Inlet" : "Outlet"} {c.id}
              {c.area ? ` · ${c.area}` : ""}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

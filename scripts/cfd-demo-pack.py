#!/usr/bin/env python3
"""Repack a CFD result view.glb for the public /cfd/demo page.

Input: the view.glb the cfd-runner wrote for a real job (cfd-runner/report.py
make_deliverables -> glb.py write_glb). The demo uses the two 12 Oct 2026
end-to-end runs behind the published sample report:
  * CF-8T90FM  90 deg bend, 913,825 cells, water 4 m/s (sample-report.pdf)
  * CF-BZ7ENO  reducer, 1,490,703 cells, water 4 m/s

No field value is changed. The repack only changes the encoding so the file
is smaller for a phone:
  * positions -> normalized int16 with a per-node translation/scale
    (KHR_mesh_quantization, read natively by three's GLTFLoader); step size is
    (largest half-extent / 32767), about 0.03 mm on these parts;
  * triangle indices -> uint16 when every index fits;
  * the streamlines' line index is dropped when it is the identity
    (0,1,2,...), which is what the runner writes;
  * vertex colours (the field colouring, uint8) and the scene extras (field
    names, units, min/max, colour maps) are copied byte for byte;
  * the whole file is gzip-compressed; the page inflates it in the browser
    with DecompressionStream (no extra library).

Usage (numpy required):
  python3 scripts/cfd-demo-pack.py IN_view.glb public/cfd/demo/bend.glb.gz
"""

from __future__ import annotations

import gzip
import json
import struct
import sys

import numpy as np

COMP = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NCOMP = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4}


def read_glb(data: bytes) -> tuple[dict, bytes]:
    magic, version, _ = struct.unpack_from("<4sII", data, 0)
    assert magic == b"glTF" and version == 2
    n, kind = struct.unpack_from("<I4s", data, 12)
    assert kind == b"JSON"
    doc = json.loads(data[20 : 20 + n])
    off = 20 + n
    bn, bkind = struct.unpack_from("<I4s", data, off)
    assert bkind == b"BIN\x00"
    return doc, data[off + 8 : off + 8 + bn]


def accessor(doc: dict, binary: bytes, idx: int) -> np.ndarray:
    a = doc["accessors"][idx]
    v = doc["bufferViews"][a["bufferView"]]
    assert "byteStride" not in v, "interleaved input not expected"
    k = NCOMP[a["type"]]
    arr = np.frombuffer(binary, dtype=COMP[a["componentType"]], count=a["count"] * k,
                        offset=v.get("byteOffset", 0) + a.get("byteOffset", 0))
    return arr.reshape(-1, k) if k > 1 else arr


def pad(b: bytes, fill: bytes = b"\x00") -> bytes:
    return b + fill * ((4 - len(b) % 4) % 4)


def repack(src: bytes) -> bytes:
    doc, binary = read_glb(src)
    buf = bytearray()
    views: list[dict] = []
    accs: list[dict] = []

    def add(arr: np.ndarray, comp: int, typ: str, target: int, *, stride: int | None = None,
            normalized: bool = False, mm: bool = False) -> int:
        off = len(buf)
        raw = arr.tobytes()
        buf.extend(pad(raw))
        view = {"buffer": 0, "byteOffset": off, "byteLength": len(raw), "target": target}
        if stride:
            view["byteStride"] = stride
        views.append(view)
        acc = {"bufferView": len(views) - 1, "componentType": comp, "count": int(arr.shape[0]), "type": typ}
        if normalized:
            acc["normalized"] = True
        if mm:
            acc["min"] = arr[:, :3].min(axis=0).tolist()
            acc["max"] = arr[:, :3].max(axis=0).tolist()
        accs.append(acc)
        return len(accs) - 1

    for mi, mesh in enumerate(doc["meshes"]):
        (prim,) = mesh["primitives"]
        pos = accessor(doc, binary, prim["attributes"]["POSITION"]).astype(np.float64)
        lo, hi = pos.min(axis=0), pos.max(axis=0)
        centre = (lo + hi) / 2
        half = float((hi - lo).max() / 2) or 1.0
        q = np.round((pos - centre) / half * 32767).clip(-32767, 32767).astype(np.int16)
        q4 = np.concatenate([q, np.zeros((len(q), 1), np.int16)], axis=1)  # 8-byte stride
        attrs = {"POSITION": add(q4, 5122, "VEC3", 34962, stride=8, normalized=True)}
        accs[attrs["POSITION"]]["min"] = q.min(axis=0).astype(int).tolist()
        accs[attrs["POSITION"]]["max"] = q.max(axis=0).astype(int).tolist()
        if "COLOR_0" in prim["attributes"]:
            col = accessor(doc, binary, prim["attributes"]["COLOR_0"])
            attrs["COLOR_0"] = add(np.ascontiguousarray(col), 5121, "VEC4", 34962, normalized=True)
        new = {"attributes": attrs, "mode": prim["mode"], "material": prim["material"]}
        if "indices" in prim:
            ix = accessor(doc, binary, prim["indices"]).astype(np.int64)
            if prim["mode"] == 1 and len(ix) == len(pos) and (ix == np.arange(len(ix))).all():
                pass  # identity: non-indexed lines draw the same segments
            elif ix.max() < 65536:
                new["indices"] = add(ix.astype(np.uint16), 5123, "SCALAR", 34963)
            else:
                new["indices"] = add(ix.astype(np.uint32), 5125, "SCALAR", 34963)
        mesh["primitives"] = [new]
        for node in doc["nodes"]:
            if node.get("mesh") == mi:
                node["translation"] = centre.tolist()
                node["scale"] = [half, half, half]

    doc["accessors"], doc["bufferViews"] = accs, views
    doc["buffers"] = [{"byteLength": len(buf)}]
    doc.setdefault("extensionsUsed", []).append("KHR_mesh_quantization")
    doc.setdefault("extensionsRequired", []).append("KHR_mesh_quantization")
    doc["asset"]["generator"] = "coreframe-cfd (repacked for /cfd/demo)"
    js = pad(json.dumps(doc, separators=(",", ":")).encode(), b" ")
    bin_ = pad(bytes(buf))
    total = 12 + 8 + len(js) + 8 + len(bin_)
    return (struct.pack("<4sII", b"glTF", 2, total) + struct.pack("<I4s", len(js), b"JSON") + js
            + struct.pack("<I4s", len(bin_), b"BIN\x00") + bin_)


def main() -> None:
    src, dst = sys.argv[1], sys.argv[2]
    data = open(src, "rb").read()
    out = repack(data)
    # Check: same scene extras, same vertex colours, positions within one quantization step.
    d0, b0 = read_glb(data)
    d1, b1 = read_glb(out)
    assert d0["scenes"][0].get("extras") == d1["scenes"][0].get("extras")
    for m0, m1, n1 in zip(d0["meshes"], d1["meshes"], d1["nodes"]):
        p0 = accessor(d0, b0, m0["primitives"][0]["attributes"]["POSITION"])
        a1 = d1["accessors"][m1["primitives"][0]["attributes"]["POSITION"]]
        v1 = d1["bufferViews"][a1["bufferView"]]
        raw = np.frombuffer(b1, np.int16, count=a1["count"] * 4, offset=v1["byteOffset"]).reshape(-1, 4)[:, :3]
        p1 = raw / 32767 * n1["scale"][0] + np.array(n1["translation"])
        err = float(np.abs(p1 - p0).max())
        assert err <= n1["scale"][0] / 32767, err
        c0 = accessor(d0, b0, m0["primitives"][0]["attributes"]["COLOR_0"])
        c1 = accessor(d1, b1, m1["primitives"][0]["attributes"]["COLOR_0"])
        assert (c0 == c1).all()
        print(f"{m1['name']}: {len(p0)} vertices, max position error {err * 1000:.4f} mm")
    with open(dst, "wb") as fh:
        fh.write(gzip.compress(out, compresslevel=9, mtime=0))
    print(f"{src}: {len(data):,} B -> glb {len(out):,} B -> gz {len(gzip.compress(out, 9, mtime=0)):,} B")


if __name__ == "__main__":
    main()

#!/usr/bin/env node
/**
 * IndexNow ping (SEO review 18 Oct 2026, action 8 / T11).
 *
 * IndexNow tells Bing, Yandex, Seznam, Naver and others that URLs changed, so
 * they recrawl in minutes instead of weeks. ChatGPT search and Copilot read
 * Bing's index. No account is needed: the key below is proved by the file
 * public/28ff5a1a9127c7055e99e2c67a83796b.txt, which Vercel serves at
 * https://www.coreframecloud.com/28ff5a1a9127c7055e99e2c67a83796b.txt.
 *
 * Run AFTER a production deploy, from the repo root:
 *
 *   node scripts/indexnow-ping.mjs            # every URL in the live sitemap
 *   node scripts/indexnow-ping.mjs /cfd /pricing   # just these paths
 *   node scripts/indexnow-ping.mjs --dry-run  # print, send nothing
 *
 * Never run it against a preview deployment: the key file and the URLs must
 * be on www.coreframecloud.com.
 */
const HOST = "www.coreframecloud.com";
const KEY = "28ff5a1a9127c7055e99e2c67a83796b";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const paths = args.filter((a) => a.startsWith("/"));

async function sitemapUrls() {
  const res = await fetch(`https://${HOST}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap.xml returned ${res.status}`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

const keyRes = await fetch(KEY_LOCATION);
if (!keyRes.ok || (await keyRes.text()).trim() !== KEY) {
  console.error(`The key file is not live at ${KEY_LOCATION}; deploy first.`);
  process.exit(1);
}

const urlList = paths.length ? paths.map((p) => `https://${HOST}${p}`) : await sitemapUrls();
console.log(`${urlList.length} URL(s)`);
if (dryRun) {
  for (const u of urlList) console.log(`  ${u}`);
  process.exit(0);
}

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
});
// 200 = accepted, 202 = accepted (key check pending); 4xx = fix and retry.
console.log(`IndexNow: ${res.status} ${res.statusText}`);
if (res.status >= 400) {
  console.error(await res.text());
  process.exit(1);
}

import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const html=readFileSync('index.html','utf8'),sw=readFileSync('sw.js','utf8');
const version=html.match(/<meta name="curiocircle-version" content="([^"]+)">/)?.[1];
assert.ok(version);
assert.equal(html.match(/const APP_VERSION="([^"]+)";/)?.[1],version,'legacy update marker must match meta version');
assert.match(version,/^\d+(?:\.\d+){2,4}(?: \(Beta\))?$/);
assert.equal(version.startsWith('0.'),version.endsWith(' (Beta)'));
assert.equal([...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].filter(m=>!m[1].includes('src=')||m[2].trim()).length,0,'no inline scripts');
const assets=JSON.parse(sw.match(/const assets=(\[[^\]]+\]);/)[1].replaceAll("'",'"'));
for(const m of html.matchAll(/(?:src|href)="(\.\/[^"#]+)"/g)){
 const url=m[1],path=url.split('?')[0];
 if(/\.(?:js|css|svg|png|webmanifest)$/.test(path)){assert.ok(existsSync(path),path);assert.ok(assets.includes(url),'offline asset '+url)}
}
for(const a of assets)if(a!=='./')assert.ok(existsSync(a.split('?')[0]),a);
assert.ok(assets.includes('./legal.html'));assert.ok(assets.includes('./index.html'));
console.log('OK: release version marker, script isolation and complete offline assets');

// scripts/make-ixbrl-fixture.ts — trims a full EDGAR inline-XBRL filing to a ≤ 200 KB test fixture, keeping the ORIGINAL
// markup of every kept fact (so tests exercise real attributes: format, scale, sign). Kept: the root element (namespaces), the
// contexts/units/dei facts the kept facts use, and every table row whose facts are all consolidated and use a concept from
// `concepts.ts` (plus the reconciliation helpers). No `style=`, no notes, no segment rows.
// Usage: npx vite-node scripts/make-ixbrl-fixture.ts <full.htm> <out.htm>
import { readFileSync, writeFileSync } from "node:fs";
import { CONCEPTS, INTEREST_INCOME, MEZZANINE, NONOPERATING_TOTAL, REVENUE } from "@/lib/parser/ixbrl/concepts";
import { readIxbrl } from "@/lib/parser/ixbrl/read";

const [src, out] = process.argv.slice(2);
const html = readFileSync(src, "utf8").replace(/<!--[\s\S]*?-->/g, "");
const doc = readIxbrl(html);
const wanted = new Set<string>([...Object.values(CONCEPTS).flat(), ...INTEREST_INCOME, ...MEZZANINE, ...NONOPERATING_TOTAL]);
const free = new Set([...doc.contexts.values()].filter((c) => c.dims.length === 0).map((c) => c.id));
// Segment and product revenue / operating income (PS3b): contexts whose dimensions are only these axes.
const SEGMENT_CONCEPTS = new Set([...REVENUE, "OperatingIncomeLoss"]);
const segmentCtx = new Set(
  [...doc.contexts.values()]
    .filter((c) => c.dims.length > 0 && c.dims.every((d) => /(StatementBusinessSegmentsAxis|ConsolidationItemsAxis|ProductOrServiceAxis)=/.test(d)))
    .map((c) => c.id),
);

const root = html.match(/<(?:\w+:)?html\b[^>]*>/i)![0];
const rows: string[] = [];
const usedContexts = new Set<string>();
const usedUnits = new Set<string>();
for (const m of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)) {
  const body = m[1];
  const facts = [...body.matchAll(/<ix:nonFraction\b[^>]*>[\s\S]*?<\/ix:nonFraction>/g)].map((x) => x[0]);
  if (facts.length === 0 || /<ix:nonFraction[^>]*>[^<]*<ix:nonFraction/.test(body)) continue;
  const names = facts.map((f) => /name="[\w-]+:(\w+)"/.exec(f)?.[1] ?? "");
  const all = facts.map((f, i) => ({ f, n: names[i], c: /contextRef="([^"]+)"/.exec(f)?.[1] ?? "" }));
  // Only consolidated facts survive (a related-party fact in the same row has a dimension and is dropped).
  const kept = all.filter((x) => free.has(x.c) || (segmentCtx.has(x.c) && SEGMENT_CONCEPTS.has(x.n)));
  if (!kept.some((x) => wanted.has(x.n))) continue;
  facts.length = 0;
  facts.push(...kept.map((x) => x.f));
  const ctxs = kept.map((x) => x.c);
  const label = (body.match(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/)?.[1] ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  ctxs.forEach((c) => usedContexts.add(c));
  facts.forEach((f) => { const u = /unitRef="([^"]+)"/.exec(f)?.[1]; if (u) usedUnits.add(u); });
  rows.push(`<tr><td>${label.replace(/&(?!amp;|#|\w+;)/g, "&amp;")}</td>${facts.map((f) => `<td>${f.replace(/\s+(?:style|class)="[^"]*"/g, "")}</td>`).join("")}</tr>`);
}
const ctxXml = [...usedContexts].map((id) => html.match(new RegExp(`<xbrli:context\\b[^>]*\\bid="${id}"[\\s\\S]*?</xbrli:context>`))?.[0] ?? "");
const unitXml = [...usedUnits].map((id) => html.match(new RegExp(`<xbrli:unit\\b[^>]*\\bid="${id}"[\\s\\S]*?</xbrli:unit>`))?.[0] ?? "");
const dei = [...html.matchAll(/<ix:nonNumeric\b[^>]*name="dei:[^"]*"[^>]*>[\s\S]*?<\/ix:nonNumeric>/g)]
  .map((x) => x[0].replace(/<[^>]*>/g, (t) => (t.startsWith("<ix:nonNumeric") || t.startsWith("</ix:nonNumeric") ? t : "")))
  .filter((x) => x.length < 600 && (x.match(/<ix:nonNumeric/g) ?? []).length === 1 && !/continuedAt|TextBlock/.test(x));
const result = `<?xml version="1.0" encoding="utf-8"?>\n${root}<head><title>fixture</title></head><body>\n<div style="display:none"><ix:header><ix:resources>\n${ctxXml.join("\n")}\n${unitXml.join("\n")}\n</ix:resources></ix:header>${dei.join("")}</div>\n<table>\n${rows.join("\n")}\n</table></body></html>\n`;
writeFileSync(out, result);
console.log(out, (result.length / 1024).toFixed(0) + " KB", rows.length, "rows", usedContexts.size, "contexts");

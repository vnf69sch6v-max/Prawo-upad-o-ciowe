// lib/ixbrl/read.ts — reader of inline XBRL facts (SEC EDGAR .htm, ESEF .xhtml), PS3a (docs/specs/2026-11-07-parser-ixbrl-html.md).
// A regex tokenizer instead of DOMParser: it runs in a Web Worker (no DOM there) and costs ~100 ms for a 2.3 MB filing.
// EDGAR and ESMA require well-formed XML, so tags are safe to tokenize if attributes are read with their quotes
// (`>` inside a value), nested `ix:nonFraction` is handled with a stack, comments are stripped and concepts are
// told apart by namespace URI rather than by prefix. An unbalanced stack is an error, never a result.

export interface IxContext {
  id: string;
  /** Duration contexts: ISO start/end. Instants: `end` only. */
  start: string | null;
  end: string;
  instant: boolean;
  /** `Axis=Member` pairs; empty = consolidated. */
  dims: string[];
  /** "2026-01-01|2026-09-30" for durations, the date for instants — the key columns are matched on. */
  sig: string;
}

export interface IxFact {
  /** Local name, e.g. "Revenues". */
  concept: string;
  /** "us-gaap" | "ifrs-full" | "dei" | other prefix as written in the document. */
  family: string;
  qname: string;
  contextId: string;
  sig: string;
  dims: string[];
  unit: string | null;
  /** Value with `scale` and `sign` applied, in units (dollars, shares, ...). */
  value: number;
  scale: number;
  decimals: string | null;
  factId: string | null;
  /** Index of the table row the fact sits in (null outside tables) and that row's label. */
  rowId: number | null;
  rowLabel: string;
  /** Document order, 0-based. */
  order: number;
}

export interface IxDocument {
  facts: IxFact[];
  contexts: Map<string, IxContext>;
  /** unitRef → measure, e.g. "usd" → "USD". */
  units: Map<string, string>;
  /** `dei:` text facts (DocumentType, EntityRegistrantName, ...). */
  dei: Map<string, string>;
  warnings: string[];
  rows: number;
}

export class IxbrlError extends Error {
  constructor(readonly kind: "not-ixbrl" | "corrupt", message: string) {
    super(message);
    this.name = "IxbrlError";
  }
}

const IX_NS = /xbrl\.org\/\d{4}\/inlineXBRL/i;
const TAG_RE = /<(\/?)([A-Za-z_][\w.-]*(?::[A-Za-z_][\w.-]*)?)((?:\s+[^\s=/>]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*(\/?)>/g;
const ATTR_RE = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;
const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘" };

function decode(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === "#") {
      const code = e[1] === "x" || e[1] === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

function attrs(src: string): Record<string, string> {
  const out: Record<string, string> = {};
  ATTR_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ATTR_RE.exec(src))) out[m[1]] = decode(m[2] ?? m[3] ?? "");
  return out;
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim();
const local = (qn: string) => qn.slice(qn.indexOf(":") + 1);

/** Parses a numeric fact's text by its `ixt` format; null = unknown/unsupported (skipped and counted, never guessed). */
export function parseIxNumber(text: string, format: string | undefined): number | null {
  const t = clean(text.replace(/[   ]/g, " "));
  const fmt = format ? local(format).toLowerCase() : "";
  if (fmt === "fixed-zero" || fmt === "fixedzero" || fmt === "zerodash" || fmt === "numdash") return 0;
  let s: string;
  if (fmt === "num-dot-decimal" || fmt === "numdotdecimal") s = t.replace(/[, ]/g, "");
  else if (fmt === "num-comma-decimal" || fmt === "numcommadecimal") s = t.replace(/[. ]/g, "").replace(",", ".");
  else if (fmt === "") {
    if (/,/.test(t)) return null;
    s = t.replace(/ /g, "");
  } else return null;
  if (!/^\d*\.?\d+$|^\d+\.?$/.test(s)) return null;
  const v = Number(s);
  return Number.isFinite(v) ? v : null;
}

interface Frame {
  kind: "num" | "text";
  a: Record<string, string>;
  text: string;
  order: number;
  row: Row | null;
}
interface Row {
  id: number;
  buf: string;
  label: string | null;
  cells: number;
  collecting: boolean;
}

/** Reads every fact and context of an inline-XBRL document. Throws `IxbrlError`. */
export function readIxbrl(source: string): IxDocument {
  const doc = source.replace(/<!--[\s\S]*?-->/g, "");
  // Namespace prefixes → family. The root element declares them.
  const ns = new Map<string, string>();
  const root = doc.match(/<(?:\w+:)?html\b[^>]*>/i)?.[0] ?? doc.slice(0, 20000);
  for (const m of root.matchAll(/xmlns:([\w.-]+)\s*=\s*"([^"]+)"/g)) ns.set(m[1], m[2]);
  const ixPrefixes = new Set([...ns].filter(([, u]) => IX_NS.test(u)).map(([p]) => p));
  if (ixPrefixes.size === 0) throw new IxbrlError("not-ixbrl", "No inline XBRL namespace in the document.");
  const family = (prefix: string): string => {
    const uri = ns.get(prefix) ?? "";
    if (/fasb\.org\/us-gaap/i.test(uri)) return "us-gaap";
    if (/xbrl\.ifrs\.org\/taxonomy.*\/ifrs-full|ifrs-full/i.test(uri)) return "ifrs-full";
    if (/xbrl\.sec\.gov\/dei|xbrl\.org\/\d{4}\/dei|\/dei\//i.test(uri)) return "dei";
    return prefix;
  };

  const contexts = readContexts(doc);
  const units = readUnits(doc);
  const dei = new Map<string, string>();
  const warnings: string[] = [];
  const unknownFormats = new Map<string, number>();
  const facts: IxFact[] = [];
  const seen = new Map<string, IxFact>();
  let dupDiffer = 0;
  let nilSkipped = 0;

  const stack: Frame[] = [];
  let row: Row | null = null;
  const rowList: Row[] = [];
  let rowCount = 0;
  let order = 0;
  let last = 0;

  const pushText = (chunk: string) => {
    if (!chunk) return;
    if (stack.length) for (const f of stack) f.text += chunk;
    if (row && row.collecting) row.buf += chunk;
  };

  TAG_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TAG_RE.exec(doc))) {
    pushText(doc.slice(last, m.index));
    last = TAG_RE.lastIndex;
    const closing = m[1] === "/";
    const qn = m[2];
    const colon = qn.indexOf(":");
    const prefix = colon > 0 ? qn.slice(0, colon) : "";
    const name = qn.slice(colon + 1);
    const selfClosing = m[4] === "/";
    const isIx = ixPrefixes.has(prefix);

    if (!isIx) {
      if (name === "tr") {
        if (!closing) {
          row = { id: rowCount++, buf: "", label: null, cells: 0, collecting: false };
          rowList.push(row);
        } else row = null;
      } else if ((name === "td" || name === "th") && row) {
        // The label is the text of the first non-empty cell (among the first three).
        if (!closing && row.label === null && row.cells < 3) {
          row.cells++;
          row.collecting = true;
          row.buf = "";
        } else if (closing && row.collecting) {
          row.collecting = false;
          const t = clean(decode(row.buf.replace(/<[^>]*>/g, " "))).replace(/\s*\$$/, "");
          if (t) row.label = t;
        }
      }
      continue;
    }

    if (closing) {
      if (name !== "nonFraction" && name !== "nonNumeric") continue;
      const f = stack.pop();
      if (!f) throw new IxbrlError("corrupt", "Unbalanced inline XBRL tags.");
      if (f.kind === "text") {
        const nm = f.a.name ?? "";
        if (family(nm.slice(0, nm.indexOf(":"))) === "dei") dei.set(local(nm), clean(decode(f.text.replace(/<[^>]*>/g, " "))));
        continue;
      }
      emitNumeric(f);
      continue;
    }

    if (name === "nonFraction" || name === "nonNumeric") {
      const a = attrs(m[3]);
      if (selfClosing) {
        // `ix:nonFraction xsi:nil="true" />` — nothing to read
        if (name === "nonFraction") nilSkipped++;
        continue;
      }
      const isDei = name === "nonNumeric" && /^[\w.-]+:/.test(a.name ?? "") && family((a.name ?? "").split(":")[0]) === "dei";
      if (name === "nonNumeric" && !isDei && stack.length === 0) {
        // Text block (a note): skip its whole content cheaply by tracking only the matching close.
        stack.push({ kind: "text", a, text: "", order: order++, row });
        continue;
      }
      stack.push({ kind: name === "nonFraction" ? "num" : "text", a, text: "", order: order++, row });
    }
  }
  pushText(doc.slice(last));
  if (stack.length) throw new IxbrlError("corrupt", "Unbalanced inline XBRL tags.");

  function emitNumeric(f: Frame) {
    const a = f.a;
    if (a["xsi:nil"] === "true" || (a.nil ?? "") === "true") {
      nilSkipped++;
      return;
    }
    const qname = a.name ?? "";
    const ctx = contexts.get(a.contextRef ?? "");
    if (!qname || !ctx) return;
    const raw = f.text.replace(/<[^>]*>/g, "");
    const base = parseIxNumber(decode(raw), a.format);
    if (base === null) {
      const k = a.format ?? "(no format)";
      unknownFormats.set(k, (unknownFormats.get(k) ?? 0) + 1);
      return;
    }
    const scale = a.scale ? Number(a.scale) : 0;
    let value = Number((base * 10 ** (Number.isFinite(scale) ? scale : 0)).toPrecision(15));
    if (a.sign === "-") value = -value;
    const fam = family(qname.split(":")[0]);
    const concept = local(qname);
    const fact: IxFact = {
      concept,
      family: fam,
      qname,
      contextId: ctx.id,
      sig: ctx.sig,
      dims: ctx.dims,
      unit: a.unitRef ? (units.get(a.unitRef) ?? a.unitRef) : null,
      value,
      scale: Number.isFinite(scale) ? scale : 0,
      decimals: a.decimals ?? null,
      factId: a.id ?? null,
      rowId: f.row ? f.row.id : null,
      rowLabel: "",
      order: f.order,
    };
    const key = `${qname}|${ctx.sig}|${ctx.dims.join(",")}|${fact.unit}`;
    const prev = seen.get(key);
    if (prev) {
      // The same fact appears in MD&A (rounded: "628.3" million) and in the statement ("628,263"). The more precise one
      // stays, wherever it stands in the document; a warning only when they differ by more than the coarser rounding.
      const pd = precision(prev.decimals);
      const nd = precision(fact.decimals);
      const coarse = Math.min(pd, nd);
      const tolerance = Number.isFinite(coarse) ? 0.5 * 10 ** -coarse + 1e-9 : Math.max(1e-6, Math.abs(value) * 1e-9);
      if (Math.abs(prev.value - value) > tolerance) dupDiffer++;
      if (nd > pd) {
        facts[facts.indexOf(prev)] = fact;
        seen.set(key, fact);
      }
      return;
    }
    seen.set(key, fact);
    facts.push(fact);
  }

  for (const [k, n] of unknownFormats) warnings.push(`${n} facts skipped: unsupported number format ${k}`);
  if (dupDiffer) warnings.push(`${dupDiffer} duplicate facts differ in value`);
  if (nilSkipped) warnings.push(`${nilSkipped} nil facts skipped`);
  facts.sort((x, y) => x.order - y.order);
  const labels = new Map(rowList.map((r) => [r.id, r.label ?? ""]));
  for (const f of facts) if (f.rowId !== null) f.rowLabel = labels.get(f.rowId) ?? "";
  return { facts, contexts, units, dei, warnings, rows: rowCount };
}

/** `decimals` → comparable precision: "INF" = exact, "-6" = millions, missing = unknown (least precise). */
function precision(decimals: string | null): number {
  if (decimals === null) return -Infinity;
  if (/^inf$/i.test(decimals)) return Infinity;
  const n = Number(decimals);
  return Number.isFinite(n) ? n : -Infinity;
}

function readContexts(doc: string): Map<string, IxContext> {
  const out = new Map<string, IxContext>();
  const re = /<(?:[\w.-]+:)?context\b([^>]*)>([\s\S]*?)<\/(?:[\w.-]+:)?context>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(doc))) {
    const id = attrs(m[1]).id;
    if (!id) continue;
    const body = m[2];
    const tag = (n: string) => body.match(new RegExp(`<(?:[\\w.-]+:)?${n}\\b[^>]*>\\s*([^<]*?)\\s*</`))?.[1] ?? null;
    const instant = tag("instant");
    const start = tag("startDate");
    const end = tag("endDate") ?? instant;
    if (!end) continue;
    const dims: string[] = [];
    for (const d of body.matchAll(/<(?:[\w.-]+:)?(?:explicitMember|typedMember)\b([^>]*)>([\s\S]*?)<\/(?:[\w.-]+:)?(?:explicitMember|typedMember)>/g)) {
      dims.push(`${attrs(d[1]).dimension ?? "?"}=${clean(d[2].replace(/<[^>]*>/g, " "))}`);
    }
    out.set(id, { id, start: instant ? null : start, end, instant: !!instant, dims, sig: instant ? end : `${start}|${end}` });
  }
  return out;
}

function readUnits(doc: string): Map<string, string> {
  const out = new Map<string, string>();
  const re = /<(?:[\w.-]+:)?unit\b([^>]*)>([\s\S]*?)<\/(?:[\w.-]+:)?unit>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(doc))) {
    const id = attrs(m[1]).id;
    if (!id) continue;
    const measures = [...m[2].matchAll(/<(?:[\w.-]+:)?measure>\s*([^<]*?)\s*</g)].map((x) => local(x[1]));
    out.set(id, measures.join("/") || id);
  }
  return out;
}

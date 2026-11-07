// LeetCode-style presentation helpers: parse a function signature, generate
// starter code per language, and show test inputs as named parameters.
import type { RunnableLanguage } from "@/lib/code-runner";

export interface Signature {
  name: string;
  params: { name: string; type: string }[];
  returnType: string;
}

/** Splits on commas that are not inside brackets, braces, parens or quotes. */
export function splitTopLevel(text: string, sep = ","): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") quote = ch;
    else if ("[{(<".includes(ch)) depth++;
    else if ("]})>".includes(ch)) depth--;
    else if (ch === sep && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
}

/** Reads `function name(a: T, b: U): R {` from TypeScript source. */
export function parseTsSignature(
  source: string | undefined,
  functionName: string,
): Signature | null {
  if (!source) return null;
  const head = source.indexOf(`function ${functionName}`);
  if (head === -1) return null;
  const open = source.indexOf("(", head);
  let depth = 0;
  let close = -1;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "(") depth++;
    else if (source[i] === ")" && --depth === 0) {
      close = i;
      break;
    }
  }
  if (open === -1 || close === -1) return null;
  const params = splitTopLevel(source.slice(open + 1, close)).map((p) => {
    const colon = p.indexOf(":");
    return colon === -1
      ? { name: p.replace(/[?=].*$/, "").trim(), type: "any" }
      : { name: p.slice(0, colon).replace("?", "").trim(), type: p.slice(colon + 1).trim() };
  });
  const after = source.slice(close + 1, source.indexOf("{", close));
  const returnType = after.includes(":") ? after.slice(after.indexOf(":") + 1).trim() : "void";
  return { name: functionName, params, returnType };
}

/** Parameter names only, from any of the reference implementations. */
export function paramNamesFrom(sources: (string | undefined)[], functionName: string): string[] {
  for (const src of sources) {
    if (!src) continue;
    const m =
      src.match(new RegExp(`function\\s+${functionName}\\s*(?:<[^>]*>)?\\(([^)]*)\\)`)) ??
      src.match(new RegExp(`def\\s+${functionName}\\s*\\(([^)]*)\\)`));
    if (m) {
      return splitTopLevel(m[1])
        .map((p) =>
          p
            .split(":")[0]
            .replace(/[?=].*$/, "")
            .trim(),
        )
        .filter((p) => p && p !== "self");
    }
  }
  return [];
}

function pyType(ts: string): string {
  const t = ts.replace(/\s+/g, "");
  if (t.endsWith("|null")) return `Optional[${pyType(t.slice(0, -5))}]`;
  if (t.endsWith("[]")) return `List[${pyType(t.slice(0, -2))}]`;
  const arr = t.match(/^Array<(.+)>$/);
  if (arr) return `List[${pyType(arr[1])}]`;
  if (t === "number") return "int";
  if (t === "string") return "str";
  if (t === "boolean") return "bool";
  if (t === "void") return "None";
  return "Any";
}

function jsDocType(ts: string): string {
  return ts.replace(/\s+/g, "") === "void" ? "void" : ts.trim();
}

/** Starter code in the style LeetCode uses for each language. */
export function leetcodeStarter(language: RunnableLanguage, sig: Signature): string {
  const names = sig.params.map((p) => p.name);
  if (language === "python") {
    const params = sig.params.map((p) => `${p.name}: ${pyType(p.type)}`);
    return `class Solution:\n    def ${sig.name}(self${params.length ? ", " + params.join(", ") : ""}) -> ${pyType(sig.returnType)}:\n        \n`;
  }
  if (language === "typescript") {
    const params = sig.params.map((p) => `${p.name}: ${p.type}`).join(", ");
    return `function ${sig.name}(${params}): ${sig.returnType} {\n    \n};\n`;
  }
  const doc = [
    "/**",
    ...sig.params.map((p) => ` * @param {${jsDocType(p.type)}} ${p.name}`),
    ` * @return {${jsDocType(sig.returnType)}}`,
    " */",
  ].join("\n");
  return `${doc}\nvar ${sig.name} = function(${names.join(", ")}) {\n    \n};\n`;
}

/** Parses a test input ("[1,2], 3") into its argument values, or null if invalid. */
export function parseArgs(input: string): unknown[] | null {
  try {
    const v = JSON.parse(`[${input}]`);
    return Array.isArray(v) ? v : null;
  } catch {
    return null;
  }
}

/** Splits a test input into one JSON string per argument. */
export function splitArgs(input: string): string[] {
  const values = parseArgs(input);
  return values ? values.map((v) => JSON.stringify(v)) : splitTopLevel(input);
}

/** "nums = [2,7,11,15], target = 9" */
export function namedInput(input: string, names: string[]): string {
  const parts = splitArgs(input);
  if (names.length !== parts.length) return input;
  return parts.map((p, i) => `${names[i]} = ${p}`).join(", ");
}

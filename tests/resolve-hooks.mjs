import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");

function withExt(p) {
  for (const cand of [p, `${p}.ts`, `${p}.tsx`, path.join(p, "index.ts")]) if (existsSync(cand) && !cand.endsWith(path.sep)) {
    if (cand === p && !/\.[a-z]+$/i.test(p)) continue;
    return cand;
  }
  return null;
}

export async function resolve(specifier, context, next) {
  let target = null;
  if (specifier.startsWith("@/")) target = withExt(path.join(SRC, specifier.slice(2)));
  else if ((specifier.startsWith("./") || specifier.startsWith("../")) && context.parentURL?.startsWith("file:")) {
    target = withExt(path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier));
  }
  if (target) {
    const url = pathToFileURL(target).href;
    if (target.endsWith(".json")) return { url, format: "json", importAttributes: { type: "json" }, shortCircuit: true };
    return { url, shortCircuit: true };
  }
  return next(specifier, context);
}

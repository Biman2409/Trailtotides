// Lets `node --test` run the app's TypeScript directly (Node 24 strips the types itself):
// maps the "@/..." alias to src/, adds the .ts extension imports leave off, and imports JSON.
import { register } from "node:module";
register("./resolve-hooks.mjs", import.meta.url);

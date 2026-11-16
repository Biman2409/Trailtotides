// Writes src/lib/leadPrices.json: the one "from" price per adventure, the same the adventure page
// leads with (the top of its Where to book list: the lowest full trip price when an operator's own
// page gives one, otherwise the lowest headline fee). Cards, Explore, the map, Compare, the price
// filter and Compass.AI read this small file instead of the 260 KB offers file.
// Run after import-operator-offers or any operator change:
//   node --import ./tests/register.mjs scripts/build-lead-prices.ts
// tests/data.test.ts fails when the file is out of date.
import { writeFileSync } from "node:fs";
import { computeLeadPrices } from "../src/lib/leadPricesCompute";

const out = computeLeadPrices();
writeFileSync("src/lib/leadPrices.json", JSON.stringify(out, null, 1) + "\n");
console.log(`leadPrices.json: ${Object.keys(out).length} adventures`);

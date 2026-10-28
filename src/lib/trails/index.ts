// Trek trails built from OpenStreetMap by scripts/build-trail.mjs, which rewrites this file.
// The data is OpenStreetMap's (ODbL), so anything that shows a trail must credit
// "© OpenStreetMap contributors".
// JSON imports type their arrays loosely, hence "as unknown as Trail".
// Server only: importing this bundles every trail. Browser code uses ./shared and fetches one
// trail at a time from /trails/<slug>.json.

import type { Trail } from "./shared";
import aliBedniBugyal from "./ali-bedni-bugyal.json";
import annapurnaBaseCamp from "./annapurna-base-camp.json";
import annapurnaCircuit from "./annapurna-circuit.json";
import baliPass from "./bali-pass.json";
import beasKund from "./beas-kund.json";
import bhriguLake from "./bhrigu-lake.json";
import brahmatal from "./brahmatal.json";
import buranGhati from "./buran-ghati.json";
import chandrakhaniPass from "./chandrakhani-pass.json";
import dayaraBugyal from "./dayara-bugyal.json";
import deoriatalChandrashila from "./deoriatal-chandrashila.json";
import doditalDarwaPass from "./dodital-darwa-pass.json";
import everestBaseCamp from "./everest-base-camp.json";
import gaumukhTapovan from "./gaumukh-tapovan.json";
import goechala from "./goechala.json";
import gokyoLakes from "./gokyo-lakes.json";
import harKiDun from "./har-ki-dun.json";
import kareriLake from "./kareri-lake.json";
import kashmirGreatLakes from "./kashmir-great-lakes.json";
import kedarkanthaTrek from "./kedarkantha-trek.json";
import khopraDanda from "./khopra-danda.json";
import kuariPass from "./kuari-pass.json";
import manasluCircuit from "./manaslu-circuit.json";
import markhaValley from "./markha-valley.json";
import pangarchullaPeak from "./pangarchulla-peak.json";
import panwaliKantha from "./panwali-kantha.json";
import pinParvatiPass from "./pin-parvati-pass.json";
import pindariGlacier from "./pindari-glacier.json";
import roopkund from "./roopkund.json";
import sandakphuPhalutTrek from "./sandakphu-phalut-trek.json";
import sarPass from "./sar-pass.json";
import satopanthLake from "./satopanth-lake.json";
import tarsarMarsarTrek from "./tarsar-marsar-trek.json";
import valleyOfFlowers from "./valley-of-flowers.json";

export * from "./shared";

const TRAILS: Record<string, Trail> = {
  "ali-bedni-bugyal": aliBedniBugyal as unknown as Trail,
  "annapurna-base-camp": annapurnaBaseCamp as unknown as Trail,
  "annapurna-circuit": annapurnaCircuit as unknown as Trail,
  "bali-pass": baliPass as unknown as Trail,
  "beas-kund": beasKund as unknown as Trail,
  "bhrigu-lake": bhriguLake as unknown as Trail,
  "brahmatal": brahmatal as unknown as Trail,
  "buran-ghati": buranGhati as unknown as Trail,
  "chandrakhani-pass": chandrakhaniPass as unknown as Trail,
  "dayara-bugyal": dayaraBugyal as unknown as Trail,
  "deoriatal-chandrashila": deoriatalChandrashila as unknown as Trail,
  "dodital-darwa-pass": doditalDarwaPass as unknown as Trail,
  "everest-base-camp": everestBaseCamp as unknown as Trail,
  "gaumukh-tapovan": gaumukhTapovan as unknown as Trail,
  "goechala": goechala as unknown as Trail,
  "gokyo-lakes": gokyoLakes as unknown as Trail,
  "har-ki-dun": harKiDun as unknown as Trail,
  "kareri-lake": kareriLake as unknown as Trail,
  "kashmir-great-lakes": kashmirGreatLakes as unknown as Trail,
  "kedarkantha-trek": kedarkanthaTrek as unknown as Trail,
  "khopra-danda": khopraDanda as unknown as Trail,
  "kuari-pass": kuariPass as unknown as Trail,
  "manaslu-circuit": manasluCircuit as unknown as Trail,
  "markha-valley": markhaValley as unknown as Trail,
  "pangarchulla-peak": pangarchullaPeak as unknown as Trail,
  "panwali-kantha": panwaliKantha as unknown as Trail,
  "pin-parvati-pass": pinParvatiPass as unknown as Trail,
  "pindari-glacier": pindariGlacier as unknown as Trail,
  "roopkund": roopkund as unknown as Trail,
  "sandakphu-phalut-trek": sandakphuPhalutTrek as unknown as Trail,
  "sar-pass": sarPass as unknown as Trail,
  "satopanth-lake": satopanthLake as unknown as Trail,
  "tarsar-marsar-trek": tarsarMarsarTrek as unknown as Trail,
  "valley-of-flowers": valleyOfFlowers as unknown as Trail,
};

export const TRAIL_SLUGS = Object.keys(TRAILS);

export function getTrail(slug: string): Trail | null {
  return TRAILS[slug] ?? null;
}

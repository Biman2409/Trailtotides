// Upload byte checks and Compass.AI request routing, on the real code.
import { test } from "node:test";
import assert from "node:assert/strict";
import { sniffImage, bytesMatchType } from "../src/lib/imageSniff";

const bytes = (...b: number[]) => new Uint8Array([...b, ...Array(16).fill(0)]);
const JPEG = bytes(0xff, 0xd8, 0xff, 0xe0);
const PNG = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
const WEBP = new Uint8Array([..."RIFF"].map((c) => c.charCodeAt(0)).concat([0, 0, 0, 0], [..."WEBP"].map((c) => c.charCodeAt(0)), Array(8).fill(0)));
const HTML = new TextEncoder().encode("<html><script>alert(1)</script></html>");
const SVG = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');

test("real images are recognised by their bytes", () => {
  assert.equal(sniffImage(JPEG), "image/jpeg");
  assert.equal(sniffImage(PNG), "image/png");
  assert.equal(sniffImage(WEBP), "image/webp");
});

test("HTML, SVG and empty files are not images, whatever type they claim", () => {
  for (const b of [HTML, SVG, new Uint8Array()]) {
    assert.equal(sniffImage(b), null);
    assert.equal(bytesMatchType(b, "image/png"), false);
  }
});

test("a file must be the type it claims ('image/jpg' counts as JPEG)", () => {
  assert.equal(bytesMatchType(JPEG, "image/jpeg"), true);
  assert.equal(bytesMatchType(JPEG, "image/jpg"), true);
  assert.equal(bytesMatchType(PNG, "image/jpeg"), false);
  assert.equal(bytesMatchType(WEBP, "image/webp"), true);
});

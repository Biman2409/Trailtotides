import React from "react";
import {
  Footprints, Bike, Mountain, Anchor, Waves, Wind,
  Snowflake, Ship, Globe, Zap,
  Triangle, CloudSnow, Fish, Tent, Car, Compass, Flame, Telescope,
} from "lucide-react";

export const ADVENTURE_TYPE_ICONS: Record<string, (size?: number) => React.ReactNode> = {
  Trekking:          (s = 14) => <Footprints style={{ width: s, height: s }} />,
  Biking:            (s = 14) => <Bike       style={{ width: s, height: s }} />,
  Cycling:           (s = 14) => <Bike       style={{ width: s, height: s }} />,
  "Rock Climbing":   (s = 14) => <Mountain   style={{ width: s, height: s }} />,
  Scrambling:        (s = 14) => <Triangle   style={{ width: s, height: s }} />,
  Mountaineering:    (s = 14) => <Mountain   style={{ width: s, height: s }} />,
  "Camel Safari":    (s = 14) => <Compass    style={{ width: s, height: s }} />,
  "Jeep Safari":     (s = 14) => <Car        style={{ width: s, height: s }} />,
  Sandboarding:      (s = 14) => <Flame      style={{ width: s, height: s }} />,
  "Urban Adventure": (s = 14) => <Globe      style={{ width: s, height: s }} />,
  Caving:            (s = 14) => <Tent       style={{ width: s, height: s }} />,
  Diving:            (s = 14) => <Anchor     style={{ width: s, height: s }} />,
  Kayaking:          (s = 14) => <Ship       style={{ width: s, height: s }} />,
  Surfing:           (s = 14) => <Waves      style={{ width: s, height: s }} />,
  "River Rafting":   (s = 14) => <Waves      style={{ width: s, height: s }} />,
  Snorkelling:       (s = 14) => <Fish       style={{ width: s, height: s }} />,
  Skiing:            (s = 14) => <Snowflake  style={{ width: s, height: s }} />,
  Snowboarding:      (s = 14) => <CloudSnow  style={{ width: s, height: s }} />,
  "Ice Climbing":    (s = 14) => <Zap        style={{ width: s, height: s }} />,
  "Snow Trekking":   (s = 14) => <Snowflake  style={{ width: s, height: s }} />,
  Paragliding:       (s = 14) => <Wind       style={{ width: s, height: s }} />,
  Skydiving:         (s = 14) => <Wind       style={{ width: s, height: s }} />,
  "Hot Air Balloon": (s = 14) => <Telescope  style={{ width: s, height: s }} />,
  "Hang Gliding":    (s = 14) => <Wind       style={{ width: s, height: s }} />,
};

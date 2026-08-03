import { readFileSync } from "node:fs";
import path from "node:path";
import type { CurriculumUnitRaw } from "./ladder";

export interface CurriculumFile {
  version: number;
  description?: string;
  units: CurriculumUnitRaw[];
}

/**
 * Load thematic unit catalog from data/curriculum/units.json (build-time).
 */
export function loadCurriculumUnits(): CurriculumUnitRaw[] {
  const filePath = path.join(
    process.cwd(),
    "data",
    "curriculum",
    "units.json",
  );
  try {
    const raw = JSON.parse(readFileSync(filePath, "utf-8")) as CurriculumFile;
    return Array.isArray(raw.units) ? raw.units : [];
  } catch (err) {
    console.warn("[curriculum] could not load units.json:", err);
    return [];
  }
}

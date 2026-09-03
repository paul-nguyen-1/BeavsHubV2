import { coreClasses, electives } from "./const";

export const splitString = (
  string: string,
  field: string
): [string, string] => {
  const [prefix, postfix] = string.split(field);
  return [prefix, postfix];
};

export const classType = (className: string) => {
  const id = className.replace(/^[A-Za-z]+\s*/, "").trim();
  if (coreClasses.some((core) => core.startsWith(id))) {
    return "Core";
  } else if (electives.some((elective) => elective.startsWith(id))) {
    return "Elective";
  } else {
    return "N/A";
  }
};

const seasonAbbreviations: Record<string, string> = {
  spring: "SP",
  summer: "SU",
  winter: "WI",
  fall: "FA",
};

export const truncate = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
};

export const termAbbrev = (taken_date: string) => {
  const [season, year] = taken_date.trim().split(" ");
  const abbrev = seasonAbbreviations[season?.toLowerCase()] ?? season;
  return year ? `${abbrev} ${year}` : abbrev;
};

/**
 * Some CJS packages get wrapped in an extra `{ default }` layer by Vite's
 * dependency pre-bundler (depth varies between dev and production builds).
 * Unwraps `.default` until it hits the real export.
 */
export const resolveDefaultExport = <T>(mod: unknown): T => {
  let value = mod;
  while (value && typeof value === "object" && "default" in value) {
    value = (value as { default: unknown }).default;
  }
  return value as T;
};

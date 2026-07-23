import { coreClasses, electives } from "./const";

export const splitString = (
  string: string,
  field: string
): [string, string] => {
  const [prefix, postfix] = string.split(field);
  return [prefix, postfix];
};

export const classType = (className: string) => {
  const id = className.replace("CS", "").trim();
  if (coreClasses.some((core) => core.startsWith(id))) {
    return "Core";
  } else if (electives.some((elective) => elective.startsWith(id))) {
    return "Elective";
  } else {
    return "N/A";
  }
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

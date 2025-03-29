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

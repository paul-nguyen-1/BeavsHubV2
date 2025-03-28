import { coreClasses, electives } from "./const";

export const splitString = (
  string: string,
  field: string
): [string, string] => {
  const [prefix, postfix] = string.split(field);
  return [prefix, postfix];
};

export const classType = (className: string) => {
  
  console.log(className)
  console.log(coreClasses.includes(className.slice(3)))
  if (coreClasses.includes(className.slice(3))) {
    return "Core";
  } else if (electives.includes(className.slice(3))) {
    return "Elective";
  } else {
    return "N/A";
  }
};

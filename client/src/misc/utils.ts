export const splitString = (
    string: string,
    field: string,
  ): [string, string] => {
    const [prefix, postfix] = string.split(field);
    return [prefix, postfix];
  };
  
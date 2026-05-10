type ClassValue = string | undefined | false | null;

export const cn = (...classes: ClassValue[]): string =>
  classes.filter(Boolean).join(" ");

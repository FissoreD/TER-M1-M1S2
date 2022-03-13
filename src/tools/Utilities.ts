export type myFunction<S, T> = { (data: S): T; };

export function same_vector(v1: any[], v2: any[]): boolean {
  return v1.map((elt, pos) => elt == v2[pos]).every(e => e);
}

/**
 * creates all generate_prefix_list from the str passed in input :
 * exemple for hello : ['', 'h', 'he', 'hel', 'hell', 'hello']
 */
export const generate_prefix_list = (str: string) =>
  Array(str.length + 1).fill(0).map((_, i) => str.substring(0, i)).reverse();

/**
 * creates all suffix from the str passed in input :
 * exemple for hello : ['hello', 'ello', 'llo', 'lo', 'o', '']
 */
export const generate_suffix_list = (str: string) =>
  Array(str.length + 1).fill("").map((_, i) => str.substring(i, str.length + 1));

export const count_str_occurrences = (str: string, obj: string) =>
  Array.from(str).filter(f => f == obj).length

export function boolToString(bool: boolean): string {
  return bool ? "1" : "0";
}
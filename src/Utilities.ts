import { Automaton } from "./Automaton";

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

export function listener_automaton_click_button(a: Automaton) {
  let next_char = () => {
    let dom = document.getElementById('input')!;
    let name = dom.innerText;
    let currentNode = name[0];
    name = name.substring(1);
    a.draw_next_step(currentNode);
    dom.innerText = name;
  };
  let x = document.getElementById("next_char")!
  x.addEventListener("click", next_char);
}
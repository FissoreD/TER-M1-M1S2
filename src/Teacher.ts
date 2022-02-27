import { Automaton } from "./Automaton.js";
import { count_str_occurrences } from "./Utilities.js";

export class Teacher {

  query(sentence: string) {
    let nb_of_zero = count_str_occurrences(sentence, "0");
    return this.boolToString(sentence.length % 2 == 0 && nb_of_zero % 2 == 0);
  }

  static i = 0;

  member(automaton: Automaton): string | undefined {
    let l = ["11", "011", undefined];
    return l[Teacher.i++];
  }

  boolToString(bool: boolean): string {
    return bool ? "1" : "0";
  }
}
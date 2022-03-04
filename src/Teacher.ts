import { Automaton } from "./Automaton.js";
import { count_str_occurrences, myFunction } from "./Utilities.js";

export class Teacher {
  check_function: myFunction<string, boolean>;
  counter_exemples: string[];
  counter: number;
  description: string;

  constructor(description: string, f: myFunction<string, boolean>, counter_exemples: string[]) {
    this.check_function = f;
    this.counter_exemples = counter_exemples;
    this.counter = 0;
    this.description = description;
  }

  query(sentence: string) {
    return this.boolToString(this.check_function(sentence));
  }

  member(automaton: Automaton): string | undefined {
    return this.counter_exemples[this.counter++];
  }

  boolToString(bool: boolean): string {
    return bool ? "1" : "0";
  }
}

/** 
 * a teacher accepting the language over {0, 1}
 * of strings with even number of 0 and even number of 1
 */
export let teacherPairZeroAndOne = new Teacher(
  `Automata accepting L = {w in (0, 1)* | #(w_0) % 2 = 0 and #(w_1) % 2 = 0} 
    → w has even nb of "0" and even nb of "1"`,
  sentence => {
    let parity = count_str_occurrences(sentence, "0");
    return parity % 2 == 0 && sentence.length % 2 == 0;
  }, ["11", "011"]);

/**
 * a teacher accepting the language over {a, b}
 * of strings with an "a" in the third letter from end
 * (exemple abb, baab, bbabbaab)
 */
export let teacherA3fromLast = new Teacher(
  `Automata accepting L = {w in (a, b)* | w[-3] = a} 
    → w has an 'a' in the 3rd pos from end`,
  sentence => sentence.length >= 3 && sentence[sentence.length - 3] == 'a',
  ["aaa"]
)
/**
 * a teacher accepting the language over {a, b}
 * of strings with any even number of "a" and at least three "b"
 */
export let teacherEvenAandThreeB = new Teacher(
  `Automata accepting L = {w in (a, b)* | #(w_b) > 2 and #(w_a) % 2 = 0}
    → w has at least 3 'b' and an even nb of 'a'`,
  sentence => count_str_occurrences(sentence, "b") >= 3 && count_str_occurrences(sentence, "a") % 2 == 0,
  ["bbb", "ababb", "bbaab", "babba"]
);
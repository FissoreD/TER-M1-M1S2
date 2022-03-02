import { Automaton } from "./Automaton.js";
import { count_str_occurrences, myFunction } from "./Utilities.js";

export class Teacher {
  check_function: myFunction<string, boolean>;
  counter_exemples: string[];
  counter: number;

  constructor(f: myFunction<string, boolean>, counter_exemples: string[]) {
    this.check_function = f;
    this.counter_exemples = counter_exemples;
    this.counter = 0;
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

export let teacherPairZeroAndOne = new Teacher(
  sentence => {
    let parity = count_str_occurrences(sentence, "0");
    return parity % 2 == 0 && sentence.length % 2 == 0;
  }, ["11", "011"]);

export let teacherA3fromLast = new Teacher(
  sentence => sentence.length >= 3 && sentence[sentence.length - 3] == 'a',
  ["aaa"]
)
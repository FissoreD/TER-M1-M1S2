import { Automaton } from "./Automaton.js";
import { count_str_occurrences, myFunction } from "./Utilities.js";

export class Teacher {
  check_function: myFunction<string, boolean>;
  counter_exemples: string[];
  counter: number;
  description: string;
  alphabet: string;
  word_apperencance: [string, boolean][];
  max_word_length = 10;

  constructor(description: string, alphabet: string, f: myFunction<string, boolean>, counter_exemples: string[]) {
    this.alphabet = alphabet;
    this.check_function = f;
    this.counter_exemples = counter_exemples;
    this.counter = 0;
    this.description = description;
    this.word_apperencance = [["", this.check_function("")]]
    this.initiate_mapping("")
    this.word_apperencance = this.word_apperencance.sort((a, b) => a[0].length - b[0].length);
  }

  initiate_mapping(word: string) {
    if (word.length > this.max_word_length) return;
    Array.from(this.alphabet).forEach(letter => {
      this.word_apperencance.push([word + letter, this.check_function(word + letter)]);
      this.initiate_mapping(word + letter)
    })
  }

  query(sentence: string): string {
    return this.boolToString(this.check_function(sentence));
  }

  member(automaton: Automaton): string | undefined {
    let res = this.word_apperencance.find((word) => {
      return automaton.accept_word_nfa(word[0]) != word[1];
    });
    return res ? res[0] : res;
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
    → w has even nb of "0" and even nb of "1"`, "01",
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
    → w has an 'a' in the 3rd pos from end`, "ab",
  sentence => sentence.length >= 3 && sentence[sentence.length - 3] == 'a',
  ["aaa"]
)
/**
 * a teacher accepting the language over {a, b}
 * of strings with any even number of "a" and at least three "b"
 */
export let teacherEvenAandThreeB = new Teacher(
  `Automata accepting L = {w in (a, b)* | #(w_b) > 2 and #(w_a) % 2 = 0}
    → w has at least 3 'b' and an even nb of 'a'`, "ab",
  sentence => count_str_occurrences(sentence, "b") >= 3 && count_str_occurrences(sentence, "a") % 2 == 0,
  ["bbb", "ababb", "bbaab", "babba"]
);

/**
 * a teacher accepting the language over {a, b}
 * of strings not having an a in a position multiple
 * of 4 
 */
export let teacherNotAfourthPos = new Teacher(
  `Automata accepting L = {w in (a,b)* and i in N | w[4 * i] != a and 4 * i <= len(w)}
    → words without an "a" in a position multiple of 4`, "ab",
  sentence => {
    for (let i = 3; i < sentence.length; i += 4) {
      if (sentence.charAt(i) == "a") return false;
    }
    return true;
  },
  ["aaaa", "baaa", "bbaaa", "bbbaaa"]
)

export let teachers = [teacherA3fromLast, teacherEvenAandThreeB, teacherNotAfourthPos, teacherPairZeroAndOne]
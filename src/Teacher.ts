import { Automaton } from "./Automaton.js";
import { boolToString, count_str_occurrences, myFunction } from "./Utilities.js";

export class Teacher {
  check_function: myFunction<string, boolean>;
  counter_exemples: string[];
  counter_exemples_pos = 0;
  counter: number;
  description: string;
  alphabet: string[];
  word_apperencance: [string, boolean][];
  max_word_length = 5;

  constructor(description: string, alphabet: string | string[], f: myFunction<string, boolean>, counter_exemples: string[], initiate_mapping?: [string, boolean][]) {
    this.alphabet = Array.from(alphabet);
    this.check_function = f;
    this.counter_exemples = counter_exemples;
    this.counter = 0;
    this.description = description;
    this.word_apperencance = initiate_mapping ? initiate_mapping : this.initiate_mapping()
    // this.initiate_mapping()
    // this.word_apperencance = this.word_apperencance.sort((a, b) => a[0].length - b[0].length);
  }

  initiate_mapping() {
    let res: [string, boolean][] = [["", this.check_function("")]]
    let alphabet = Array.from(this.alphabet).sort()
    let level = Array.from(alphabet)
    while (res[res.length - 1][0].length < this.max_word_length) {
      let res1: string[] = []
      level.forEach(e => alphabet.forEach(a => {
        res.push([e + a, this.check_function(e + a)])
        res1.push(e + a)
      }))
      level = res1
    }
    return res;
  }

  query(sentence: string): string {
    return boolToString(this.check_function(sentence));
  }

  member(automaton: Automaton): string | undefined {
    if (this.counter_exemples_pos < this.counter_exemples.length) {
      return this.counter_exemples[this.counter_exemples_pos++]
    }
    let res = this.word_apperencance.find((word) => {
      return automaton.accept_word_nfa(word[0])[0] != word[1];
    });
    return res ? res[0] : res;
  }
}

/** 
 * a teacher accepting the language over {0, 1}
 * of strings with even number of 0 and even number of 1
 */
export let teacherPairZeroAndOne = new Teacher(
  `Automata accepting \\(L = \\{w \\in (0, 1)^* | \\#(w_0) \\% 2 = 0 \\land \\#(w_1) \\% 2 = 0\\}\\) <br/> → words with even nb of '0' and even nb of '1'`, "01",
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
  `Automata accepting \\(L = \\{w \\in (a, b)^* | w[-3] = a\\}\\) <br/>
    → words with an 'a' in the 3rd pos from end`, "ab",
  sentence => sentence.length >= 3 && sentence[sentence.length - 3] == 'a',
  ["aaa"]
)
/**
 * a teacher accepting the language over {a, b}
 * of strings with any even number of "a" or at least three "b"
 */
export let teacherEvenAandThreeB = new Teacher(
  `Automata accepting \\(L = \\{w \\in (a, b)^* | \\#(w_b) \\geq 3 \\lor \\#(w_a) \\% 2 = 1\\}\\)
  <br/> → words with at least 3 'b' or an odd nb of 'a'`, "ab",
  sentence => count_str_occurrences(sentence, "b") >= 3 || count_str_occurrences(sentence, "a") % 2 == 1,
  []
  // ["bbb", "ababb", "bbaab", "babba"]
);

/**
 * a teacher accepting the language over {a, b}
 * of strings not having an a in a position multiple
 * of 4 
 */
export let teacherNotAfourthPos = new Teacher(
  `Automata accepting \\(L = \\{w \\in (a,b)^* \\land i \\in 4\\mathbb{N} | w[i] \\neq a \\land i \\leq len(w)\\}\\) <br/>
  → words without an 'a' in a position multiple of 4`, "ba",
  sentence => {
    for (let i = 3; i < sentence.length; i += 4) {
      if (sentence.charAt(i) == "a") return false;
    }
    return true;
  },
  ["aaaa"]
)

/**
 * a teacher accepting the language over {a, b}
 * of strings not having an a in a position multiple
 * of 4 
 */
export let teacher_bStar_a_or_aStart_bStar = new Teacher(
  `Automata accepting \\(L = regex(^\\land((b^+a) | (a^*b^*))$)\\)`, "ab",
  sentence => {
    return sentence.match(/^((b+a)|(a*b*))$/g) != undefined
  },
  ["aaaa", "baaa", "bbaaa", "bbbaaa"]
)

export let binaryAddition = new Teacher(
  `Automata accepting the sum between binary words, exemple : <br>
  <pre>
  0101 + 
  1001 = 
  1110 </pre>
  we encode this sum as the concatenation of vectors of size 3 : <br>
  <pre>
  fst column 011 = 3
  snd column 101 = 5 
  trd column 001 = 1 
  fth column 110 = 6 </pre>
  so 3516 which is a valid word for the sum <br>
  <input class="sum-calc sum-calc-style" onkeyup="update_input()"> + <br>
  <input class="sum-calc sum-calc-style" onkeyup="update_input()"> = <br>
  <input class="sum-calc sum-calc-style" onkeyup="update_input()"><br>
  <button id="calc" onclick="send_calc_button()">Send</button>
  <span class="sum-calc-style" id="add-res"></span>
  `,
  "01234567", sentence => {
    let charToBin = (char: string) =>
      (parseInt(char) >>> 0).toString(2).padStart(3, "0")
    let sentenceAr = Array.from(sentence).map(e => charToBin(e))
    // console.log(sentence)
    let fst_term = parseInt(sentenceAr.map(e => e[0]).join(''), 2);
    let snd_term = parseInt(sentenceAr.map(e => e[1]).join(''), 2);
    let trd_term = parseInt(sentenceAr.map(e => e[2]).join(''), 2);
    // console.log(fst_term, snd_term, trd_term);
    return fst_term + snd_term == trd_term;
  }, []
)

export let teachers = [binaryAddition, teacherA3fromLast, teacherEvenAandThreeB, teacherNotAfourthPos, teacherPairZeroAndOne, teacher_bStar_a_or_aStart_bStar]
import { MyAutomatonToHis } from "../automaton/automaton_type.js";
import { minimizeAutomaton } from "../automaton/automaton_type.js";
import { Automaton, State } from "../automaton/Automaton.js";
import { TeacherAutomaton } from "./TeacherAutomaton.js";
import { TeacherNoAutomaton } from "./TeacherNoAutomaton.js";
import { TeacherTakingAut } from "./TeacherTakingAut.js";
import { txtToAutomaton } from "../tools/Utilities.js";

export interface Teacher {
  description: string;
  alphabet: string[];
  counter_examples?: string[];
  regex: string;
  automaton?: Automaton;
  member(sentence: string): string;
  equiv(automaton: Automaton): string | undefined;
}
/** 
 * a teacher accepting a + (ba)*
 */
export let teacher_a_or_baStar = new TeacherAutomaton("a+(ba)*");

/** 
 * a teacher accepting the language over {0, 1}
 * of strings with even number of 0 and even number of 1
 */
export let teacherPairZeroAndOne = new TeacherAutomaton(
  "(00+11+(01+10)(00+11)*(01+10))*",
  `Automaton accepting \\(L = \\{w \\in (0, 1)^* | \\#(w_0) \\% 2 = 0 \\land \\#(w_1) \\% 2 = 0\\}\\) <br/> → words with even nb of '0' and even nb of '1'`);

/**
 * a teacher accepting the language over {a, b}
 * of strings with an "a" in the third letter from end
 * (exemple abb, baab, bbabbaab)
 */
export let teacherA3fromLast = new TeacherAutomaton(
  "(a+b)*a(a+b)(a+b)",
  `Automaton accepting \\(L = \\{w \\in (a, b)^* | w[-3] = a\\}\\) <br/>
    → words with an 'a' in the 3rd pos from end`,
)
/**
 * a teacher accepting the language over {a, b}
 * of strings with any even number of "a" or at least three "b"
 */
export let teacherEvenAandThreeB = new TeacherAutomaton(
  "b*a(b+ab*a)*+(a+b)*ba*ba*b(a+b)*",
  `Automaton accepting \\(L = \\{w \\in (a, b)^* | \\#(w_b) \\geq 3 \\lor \\#(w_a) \\% 2 = 1\\}\\)
  <br/> → words with at least 3 'b' or an odd nb of 'a'`
);

/**
 * a teacher accepting the language over {a, b}
 * of strings not having an a in a position multiple
 * of 4 
 */
export let teacherNotAfourthPos = new TeacherAutomaton(
  "((a+b)(a+b)(a+b)b)*(a+b+$)(a+b+$)(a+b+$)",
  `Automaton accepting \\(L = \\{w \\in (a,b)^* \\land i \\in 4\\mathbb{N} | w[i] \\neq a \\land i \\leq len(w)\\}\\) <br/>
  → words without an 'a' in a position multiple of 4`)

/**
 * a teacher accepting the regex bb*a + a*b*
 */
export let teacher_bStar_a_or_aStart_bStar = new TeacherNoAutomaton(
  { alphabet: "ab", regex: "((bb*a)|(a*b*))", counter_examples: ["bba", "b", "aabb", "aba", "aa", "bbaa"] },
  `Automaton accepting \\(L = regex((bb^*a) + (a^*b^*))\\)`)

/**
 * a teacher accepting the regex bb*($ + a(b(a+b))*)
 */
export let teacher_b_bStar_a__b_aOrb_star = new TeacherAutomaton("bb*($+a(b(a+b))*)")

export let binaryAddition = new TeacherNoAutomaton(
  {
    alphabet: "012345678",
    regex: sentence => {
      let charToBin = (char: string) =>
        (parseInt(char) >>> 0).toString(2).padStart(3, "0")
      let sentenceAr = Array.from(sentence).map(e => charToBin(e))
      let fst_term = parseInt(sentenceAr.map(e => e[0]).join(''), 2);
      let snd_term = parseInt(sentenceAr.map(e => e[1]).join(''), 2);
      let trd_term = parseInt(sentenceAr.map(e => e[2]).join(''), 2);
      return fst_term + snd_term == trd_term;
    },
    counter_examples: []
  },
  `Automaton accepting the sum between binary words, exemple : <br>
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
)

let automatonList: Automaton[] = []
for (let n = 4; n < 5 + 1; n++) {
  let states: State[] = new Array(n).fill(0).map((_, i) => new State(i + "", i == 0, i < n / 2, ['a', 'b']));

  for (let i = 0; i < n - 1; i++)
    states[i].addTransition('a', states[i + 1])
  states[n - 1].addTransition('a', states[0]);
  states[0].addTransition('b', states[0]);
  for (let i = 2; i < n; i++)
    states[i].addTransition('b', states[i - 1])
  states[1].addTransition('b', states[n - 1])
  automatonList.push(minimizeAutomaton(MyAutomatonToHis(new Automaton(new Set(states)))));
}

let badForNl = new TeacherTakingAut({ automaton: automatonList[0] });

let test = new TeacherTakingAut({
  automaton: txtToAutomaton(`[0]
a0,[29]->[21]
a1,[29]->[18]
a1,[29]->[16]
a0,[28]->[25]
a0,[28]->[18]
a0,[28]->[17]
a0,[28]->[15]
a0,[28]->[11]
a0,[27]->[29]
a0,[27]->[15]
a0,[27]->[5]
a0,[27]->[0]
a1,[27]->[9]
a0,[26]->[16]
a0,[26]->[1]
a1,[26]->[18]
a1,[26]->[7]
a0,[25]->[6]
a0,[25]->[3]
a0,[24]->[15]
a0,[24]->[11]
a0,[24]->[10]
a0,[24]->[8]
a0,[24]->[6]
a0,[24]->[2]
a1,[24]->[17]
a1,[24]->[5]
a1,[24]->[3]
a0,[23]->[27]
a0,[23]->[13]
a0,[23]->[6]
a0,[22]->[23]
a1,[22]->[27]
a1,[22]->[10]
a1,[22]->[5]
a0,[21]->[18]
a0,[21]->[13]
a1,[21]->[19]
a1,[21]->[6]
a0,[20]->[13]
a0,[20]->[5]
a0,[19]->[27]
a1,[19]->[10]
a0,[18]->[21]
a1,[18]->[7]
a1,[18]->[6]
a1,[18]->[0]
a0,[17]->[3]
a1,[17]->[22]
a1,[17]->[19]
a1,[17]->[9]
a0,[16]->[27]
a0,[16]->[23]
a0,[16]->[1]
a1,[16]->[25]
a1,[16]->[15]
a1,[16]->[13]
a1,[16]->[9]
a1,[16]->[0]
a0,[15]->[20]
a1,[15]->[28]
a1,[15]->[24]
a1,[15]->[9]
a1,[15]->[1]
a0,[14]->[26]
a0,[14]->[6]
a1,[14]->[4]
a0,[13]->[21]
a1,[13]->[9]
a1,[13]->[3]
a1,[12]->[18]
a1,[12]->[13]
a1,[12]->[9]
a1,[12]->[7]
a0,[11]->[5]
a0,[11]->[4]
a0,[10]->[13]
a0,[10]->[5]
a1,[10]->[26]
a1,[10]->[24]
a1,[10]->[23]
a1,[10]->[20]
a1,[10]->[2]
a0,[9]->[14]
a1,[9]->[11]
a1,[9]->[8]
a0,[8]->[14]
a0,[8]->[6]
a0,[8]->[1]
a1,[8]->[24]
a0,[7]->[27]
a1,[7]->[10]
a0,[6]->[19]
a0,[6]->[4]
a0,[6]->[1]
a1,[6]->[27]
a1,[6]->[15]
a1,[6]->[6]
a1,[6]->[3]
a1,[6]->[2]
a1,[5]->[10]
a1,[5]->[9]
a1,[5]->[8]
a0,[4]->[27]
a0,[4]->[22]
a0,[4]->[18]
a0,[4]->[14]
a0,[4]->[11]
a0,[4]->[6]
a1,[3]->[23]
a1,[3]->[22]
a0,[2]->[21]
a1,[2]->[22]
a0,[1]->[29]
a1,[1]->[28]
a1,[1]->[25]
a1,[1]->[23]
a1,[1]->[19]
a0,[0]->[24]
a0,[0]->[23]
[27]
[13]
[0]`)
})

export let teachers = [test, badForNl, teacher_a_or_baStar, teacher_b_bStar_a__b_aOrb_star, binaryAddition, teacherA3fromLast, teacherEvenAandThreeB, teacherNotAfourthPos, teacherPairZeroAndOne, teacher_bStar_a_or_aStart_bStar]
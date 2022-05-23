import { LearnerBase } from "../learners/LearnerBase.js";
import { clearFile, csvHead, printCsvCompare, writeToFile } from "./PrintFunction.js";
import { L_star } from "../learners/L_star.js";
import { NL_star } from "../learners/NL_star.js";
import { TeacherAutomaton } from "../teacher/TeacherAutomaton.js";
import { Automaton, State } from "../automaton/Automaton.js";
import { minimizeAutomaton, MyAutomatonToHis } from "../automaton/automaton_type.js";
import { allStringFromAlphabet, myLog } from "../tools/Utilities.js";

/**
 * About this file : 
 * The goal here is to compare L and NL algo in term
 * of the number of queries and equiv function that 
 * the learner will ask to the teacher.
 * We measure in this way a particular kind of 
 * complexity of these algorithms and will try to 
 * test which one of the two algorithms will perform less
 * interactions with the teacher.
 */

let toWrite = true

let fileName = "wrostRFSA";
if (toWrite) {
  clearFile(fileName)
  writeToFile(fileName, csvHead)
}

let automatonList: Automaton[] = []
let counter_examples = allStringFromAlphabet({ alphabet: "ab", maxLength: 14 })
const N = 2, maxN = 11;
for (let n = N; n < maxN; n++) {
  myLog({ a: ["Creating test with", n, "power"] });

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


let printInfo = (algo: LearnerBase, algoName: string) => {
  return `${algoName} : queries = ${algo.member_number}, equiv = ${algo.equiv_number}, states = ${algo.automaton?.state_number()}, transitions = ${algo.automaton?.transition_number()}`;
}

for (let i = 0; i < automatonList.length; i++) {
  let automaton = automatonList[i]
  let teacher = new TeacherAutomaton({
    automaton: automaton,
    description: (N + i) + "",
    counter_examples: counter_examples
  })

  let L = new L_star(teacher)
  let NL = new NL_star(teacher)

  myLog({ a: ["=".repeat(100)] });
  myLog({ a: ["Current n : ", N + i] });

  myLog({ a: ["In L*"] });
  L.make_all_queries();
  myLog({ a: [printInfo(L, "L*")] });

  myLog({ a: ["In NL*"] });
  NL.make_all_queries();
  myLog({ a: [printInfo(NL, "NL*")] });

  if (toWrite) writeToFile(fileName, printCsvCompare(L, NL))
}

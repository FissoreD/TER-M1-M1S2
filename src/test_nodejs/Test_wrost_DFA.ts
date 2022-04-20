import { LearnerBase } from "../learners/LearnerBase.js";
import { clearFile, csvHead, printCsvCompare, writeToFile } from "./PrintFunction.js";
import { L_star } from "../learners/L_star.js";
import { NL_star } from "../learners/NL_star.js";
import { TeacherNoAutomaton } from "../teacher/TeacherNoAutomaton.js";

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

let toWrite = false

let fileName = "wrostDFA";
if (toWrite) {
  clearFile(fileName)
  writeToFile(fileName, csvHead)
}
let regexList: [string, string[]][] = []
const minN = 0, maxN = 10;
for (let i = minN; i < maxN; i++) {
  let counter_examples: string[] = []
  for (let j = Math.max(0, i - 3); j <= i + 3; j++) {
    counter_examples.push("a".repeat(j))
    counter_examples.push("a".repeat(j) + "b")
    counter_examples.push("a".repeat(j) + "b" + "a".repeat(i))
    counter_examples.push("a".repeat(j) + "b" + "b".repeat(i))
    counter_examples.push("a".repeat(j) + "a" + "b".repeat(i))
  }
  counter_examples.push("bbbbbbbbbbbbbbbabbbbbab")
  regexList.push(["(a+b)*a" + "(a+b)".repeat(i), counter_examples])
}


let printInfo = (algo: LearnerBase, algoName: string) => {
  return `${algoName} : queries = ${algo.member_number}, equiv = ${algo.equiv_number}, states = ${algo.automaton?.state_number()}, transitions = ${algo.automaton?.transition_number()}`;
}

for (let index = 0; index < regexList.length; index++) {
  const [regex, counter_examples] = regexList[index]
  let teacher1 = new TeacherNoAutomaton({
    alphabet: "ab",
    regex: regex.replace(/\+/g, "|"),
    counter_examples: counter_examples,
  }, (minN + index) + "")
  // let teacher2 = new TeacherAutomaton(regex);
  let teacher = teacher1;

  let L = new L_star(teacher)
  let NL = new NL_star(teacher)

  console.log("==============================");
  console.log("Current regexp : ", regex);

  console.log("In L*");

  L.make_all_queries();
  console.log(printInfo(L, "L*"));
  console.log("In NL*");
  NL.make_all_queries();
  console.log(printInfo(NL, "NL*"));

  if (toWrite) writeToFile(fileName, printCsvCompare(L, NL))
}

import { LernerBase } from "../lerners/LernerBase.js";
import { clearFile, csvHead, printCsvCompare, writeToFile } from "./PrintFunction.js";
import { L_star } from "../lerners/L_star.js";
import { NL_star } from "../lerners/NL_star.js";
import { TeacherNoAutomaton } from "../teacher/TeacherNoAutomaton.js";
import { TeacherAutomaton } from "../teacher/TeacherAutomaton.js";

/**
 * About this file : 
 * The goal here is to compare L and NL algo in term
 * of the number of queries and equiv function that 
 * the lerner will ask to the teacher.
 * We measure in this way a particular kind of 
 * complexity of these algorithms and will try to 
 * test which one of the two algorithms will perform less
 * interactions with the teacher.
 */

let toWrite = false

let fileName = "wrostDFA";
clearFile(fileName)
writeToFile(fileName, csvHead)

let regexList: [string, string[]][] = []
for (let i = 8; i < 10; i++) {
  let counter_exemples: string[] = []
  for (let j = Math.max(0, i - 3); j <= i + 3; j++) {
    counter_exemples.push("a".repeat(j))
    counter_exemples.push("a".repeat(j) + "b")
    counter_exemples.push("a".repeat(j) + "b" + "a".repeat(i))
    counter_exemples.push("a".repeat(j) + "b" + "b".repeat(i))
    counter_exemples.push("a".repeat(j) + "a" + "b".repeat(i))
  }
  counter_exemples.push("bbbbbbbbbbbbbbbabbbbbab")
  regexList.push(["(a+b)*a" + "(a+b)".repeat(i), counter_exemples])
}


let printInfo = (algo: LernerBase, algoName: string) => {
  return `${algoName} : queries = ${algo.member_number}, equiv = ${algo.equiv_number}, states = ${algo.automaton?.state_number()}, transitions = ${algo.automaton?.transition_number()}`;
}

for (const [regex, counter_exemples] of regexList) {
  let teacher1 = new TeacherNoAutomaton({
    alphabet: "ab",
    regex: regex.replace(/\+/g, "|"),
    counter_exemples: counter_exemples
  })
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

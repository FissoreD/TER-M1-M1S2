import { LernerBase } from "../lerners/LernerBase.js";
import { clearFile, csvHead, printCsvCompare, writeToFile } from "./PrintFunction.js";
import { Teacher } from "../Teacher.js";
import { L_star } from "../lerners/L_star.js";
import { NL_star } from "../lerners/NL_star.js";

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

let fileName = "wrostDFA";
clearFile(fileName)
writeToFile(fileName, csvHead)

let regexList: string[] = []
for (let i = 0; i < 6; i++) {
  regexList.push("(a+b)*a" + "(a+b)".repeat(i))
}

let printInfo = (algo: LernerBase, algoName: string) => {
  return `${algoName} : queries = ${algo.member_number}, equiv = ${algo.equiv_number}, states = ${algo.automaton?.state_number()}, transitions = ${algo.automaton?.transition_number()}`;
}

for (const regex of regexList) {

  let teacher = new Teacher("", regex)
  let L = new L_star(teacher)
  let NL = new NL_star(teacher)

  // console.log("==============================");
  // console.log("Current regexp : ", regex);

  L.make_all_queries();
  console.log(printInfo(L, "L*"));
  NL.make_all_queries();
  console.log(printInfo(NL, "NL*"));

  writeToFile(fileName, printCsvCompare(L, NL))
}

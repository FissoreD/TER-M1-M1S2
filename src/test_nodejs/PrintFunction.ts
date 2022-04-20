import { L_star } from "../learners/L_star.js";
import { NL_star } from "../learners/NL_star.js";
import { LearnerBase } from "../learners/LearnerBase.js";
import { strict } from "assert";
import { appendFileSync, writeFileSync } from "fs";


export let printInfo = (algo: LearnerBase, algoName: string) => {
  return `${algoName} : queries = ${algo.member_number}, equiv = ${algo.equiv_number}, states = ${algo.automaton?.state_number()}, transitions = ${algo.automaton?.transition_number()}`;
}

export let printCsvCompare = (L: L_star, NL: NL_star) => {
  strict(L.teacher == NL.teacher)
  return `${L.teacher.regex},${L.teacher.alphabet.length},${L.teacher.description.split(",")[0]},${L.member_number},${NL.member_number},${L.equiv_number},${NL.equiv_number},${L.automaton?.state_number()},${NL.automaton?.state_number()},${L.automaton?.transition_number()},${NL.automaton?.transition_number()}`;
}

export let csvHead = "Regex,Length alphabet,Description,L Membership queries,NL Membership queries,L Equivalence queries,NL Equivalence queries,L State nb in A,NL State nb in A,L Transition nb in A,NL Transition nb in A"

let fileNameToCsv = (fileName: string) => "./statistics/" + fileName + ".csv"

export let clearFile = (fileName: string) => writeFileSync(fileNameToCsv(fileName), "")

export let writeToFile = (fileName: string, content: string) => {
  appendFileSync(fileNameToCsv(fileName), content + "\n")
}
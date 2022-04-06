import { L_star } from "../lerners/L_star.js";
import { NL_star } from "../lerners/NL_star.js";
import { LernerBase } from "../lerners/LernerBase.js";
import { strict } from "assert";
import { appendFile, appendFileSync, writeFile, writeFileSync } from "fs";


export let printInfo = (algo: LernerBase, algoName: string) => {
  return `${algoName} : queries = ${algo.member_number}, equiv = ${algo.equiv_number}, states = ${algo.automaton?.state_number()}, transitions = ${algo.automaton?.transition_number()}`;
}

export let printCsvCompare = (L: L_star, NL: NL_star) => {
  strict(L.teacher == NL.teacher)
  return `${L.teacher.regex},${L.teacher.alphabet.length},${L.member_number},${L.equiv_number},${L.automaton?.state_number()},${L.automaton?.transition_number()},${NL.member_number},${NL.equiv_number},${NL.automaton?.state_number()},${NL.automaton?.transition_number()}`;
}

export let csvHead = "regex,Alp Length,L Member,L Equiv,L Aut State,L Aut Tran,NL Member,NL Equiv,NL Aut State,NL Aut Tran"

let fileNameToCsv = (fileName: string) => "./statistics/" + fileName + ".csv"

export let clearFile = (fileName: string) => writeFileSync(fileNameToCsv(fileName), "")

export let writeToFile = (fileName: string, content: string) => {
  appendFileSync(fileNameToCsv(fileName), content + "\n")
}
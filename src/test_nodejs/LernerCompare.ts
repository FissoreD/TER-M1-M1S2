import { NL_star } from "../lerners/NL_star.js";
import { L_star } from "../lerners/L_star.js";
import { teachers } from "../Teacher.js";
import assert from 'assert/strict';
import { LernerBase } from "../lerners/LernerBase.js";
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

let compare = (a: L_star, b: NL_star) => {
  let printInfo = (algoName: string, algo: LernerBase) => {
    return `${algoName} : queries = ${algo.member_number}, equiv = ${algo.equiv_number}, states = ${algo.automaton?.states.length}`;
  }
  assert(a.teacher == b.teacher)

  console.log(printInfo("L Star", a));
  console.log(printInfo("NL Star", b));
}

for (const teacher of teachers) {
  let lernerL = new L_star(teacher)
  let lernerNL = new NL_star(teacher)

  console.log("==============================");
  console.log("Current regexp : ", teacher.regex);

  lernerL.make_all_queries()

  lernerNL.make_all_queries()

  compare(lernerL, lernerNL)
}
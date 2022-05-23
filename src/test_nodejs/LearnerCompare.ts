import { NL_star } from "../learners/NL_star.js";
import { L_star } from "../learners/L_star.js";
import { teachers } from "../teacher/Teacher.js";
import { clearFile, csvHead, printCsvCompare, printInfo, writeToFile } from "./PrintFunction.js";
import { myLog } from "../tools/Utilities.js";
import { TeacherAutomaton } from "../teacher/TeacherAutomaton.js";
import { readFileSync } from "fs";
import { Automaton } from "../automaton/Automaton.js";

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

let fileName = "randomRegex", writeToFileB = false,
  teachers1 = [...teachers, new TeacherAutomaton({ automaton: Automaton.strToAutomaton(readFileSync('./statistics/benchMark/2-0.1/A6.ba').toString()), regex: '2-0.1/A6.ba' })];

if (writeToFileB) {
  clearFile(fileName)
  writeToFile(fileName, csvHead)
}
for (let index = 0; index < teachers1.length; index++) {
  const teacher = teachers1[index];
  teacher.description = index + "";

  let L = new L_star(teacher);
  let NL = new NL_star(teacher);

  console.log("==============================");
  console.log("Current regexp : ", teacher.regex, teacher.description);

  L.make_all_queries()
  console.log(printInfo(L, "L*"))

  NL.make_all_queries()
  console.log(printInfo(NL, "NL*"))

  if (writeToFileB)
    writeToFile(fileName, printCsvCompare(L, NL))
}
import { NL_star } from "../learners/NL_star.js";
import { L_star } from "../learners/L_star.js";
import { teachers } from "../teacher/Teacher.js";
import { clearFile, csvHead, printCsvCompare, printInfo, writeToFile } from "./PrintFunction.js";
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

let fileName = "randomRegex";
clearFile(fileName)
writeToFile(fileName, csvHead)

for (let index = 0; index < teachers.length; index++) {
  const teacher = teachers[index];
  teacher.description = index + "";

  let L = new L_star(teacher);
  let NL = new NL_star(teacher);

  console.log("==============================");
  console.log("Current regexp : ", teacher.regex, teacher.description);

  L.make_all_queries()
  printInfo(L, "L*")

  NL.make_all_queries()
  printInfo(L, "NL*")

  writeToFile(fileName, printCsvCompare(L, NL))
}
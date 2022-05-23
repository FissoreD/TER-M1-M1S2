import { LearnerBase } from "../learners/LearnerBase.js";
import { clearFile, csvHead, printCsvCompare, printInfo, writeToFile } from "./PrintFunction.js";
import { L_star } from "../learners/L_star.js";
import { NL_star } from "../learners/NL_star.js";
import { TeacherAutomaton } from "../teacher/TeacherAutomaton.js";
import { Automaton, State } from "../automaton/Automaton.js";
import { minimizeAutomaton, MyAutomatonToHis, regexToAutomaton } from "../automaton/automaton_type.js";
import { allStringFromAlphabet, myLog } from "../tools/Utilities.js";
import { TeacherRegex } from "../teacher/TeacherRegex.js";
import { TeacherAutomatonStr } from "../teacher/TeacherAutomatonStr.js";

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

let teacherList: TeacherAutomaton[] = [];

for (let i = 0; i < 20; i++) {
  let regex = "$";
  for (let j = 0; j < i; j++) {
    regex = regex + "+" + "a".repeat(2 * j + 1) + (j > 0 ? ("+" + "b".repeat(2 * j)) : "")
  }
  teacherList.push(new TeacherAutomaton({ automaton: regexToAutomaton(regex), description: i + "" }))
  console.log(i);

}

let toWrite = true

let fileName = "sameStates";
if (toWrite) {
  clearFile(fileName)
  writeToFile(fileName, csvHead)
}

for (let i = 0; i < teacherList.length; i++) {
  // let automaton = automatonList[i]
  // let teacher = new TeacherAutomaton({
  //   automaton: automaton,
  //   description: (N + i) + "",
  //   counter_examples: counter_examples
  // })
  let teacher = teacherList[i];

  let L = new L_star(teacher)
  let NL = new NL_star(teacher)

  myLog({ a: ["=".repeat(100)], toLog: true });
  myLog({ a: ["Current n : ", i], toLog: true });

  myLog({ a: ["In L*"], toLog: true });
  L.make_all_queries();
  myLog({ a: [printInfo(L, "L*")], toLog: true });

  myLog({ a: ["In NL*"], toLog: true });
  NL.make_all_queries();
  myLog({ a: [printInfo(NL, "NL*")], toLog: true });

  if (toWrite) writeToFile(fileName, printCsvCompare(L, NL))
}

import { Automaton } from "../automaton/Automaton.js";
import { readdirSync, readFileSync } from "fs";
import { txtToAutomaton } from "../tools/Utilities.js";
import { TeacherTakingAut } from "../teacher/TeacherTakingAut.js";
import { L_star } from "../learners/L_star.js";
import { NL_star } from "../learners/NL_star.js";
import { clearFile, csvHead, printCsvCompare, printInfo, writeToFile } from "./PrintFunction.js";

let path = "./statistics/benchMark/",
  files = readdirSync(path),
  automata: Automaton[] = [],
  toWrite = true;


for (const file of files) {
  let content = readFileSync(path + file).toString();
  let automaton = txtToAutomaton(content);
  automata.push(automaton);
}

let fileName = "benchMark";
if (toWrite) {
  clearFile(fileName)
  writeToFile(fileName, csvHead)
}

for (let index = 0; index < automata.length; index++) {
  const automaton = automata[index];

  let teacher = new TeacherTakingAut({ automaton: automaton, description: index + "" });
  let L = new L_star(teacher),
    NL = new NL_star(teacher);

  console.log("=".repeat(90))
  console.log("Current benchmark : ", index);

  console.log("In L*");

  L.make_all_queries();
  console.log(printInfo(L, "L*"));
  console.log("-".repeat(80));
  console.log("In NL*");
  NL.make_all_queries();
  console.log(printInfo(NL, "NL*"));

  if (toWrite) writeToFile(fileName, printCsvCompare(L, NL))
}
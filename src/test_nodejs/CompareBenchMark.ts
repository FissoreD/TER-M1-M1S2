import { readdirSync, readFileSync } from "fs";
import { txtToAutomaton } from "../tools/Utilities.js";
import { clearFile, csvHead, printCsvCompare, printInfo, writeToFile } from "./PrintFunction.js";
import { TeacherTakingAut } from "../teacher/TeacherTakingAut.js";
import { L_star } from "../learners/L_star.js";
import { NL_star } from "../learners/NL_star.js";
import { Teacher } from "../teacher/Teacher.js";

let path = "./statistics/benchMark/",
  fileName = "benchMark",
  files = readdirSync(path),
  automata: [Teacher, string][] = [],
  toWrite = false;


for (const file of files) {
  if (!file.endsWith('.ba')) continue
  console.log("=".repeat(90))
  console.error("Creating automaton of file", file);
  console.log("Creating automaton of file", file);
  let content = readFileSync(path + file).toString();
  let automaton = txtToAutomaton(content);
  automata.push([new TeacherTakingAut({ automaton: automaton, regex: file }), file]);
}

console.log("=".repeat(90))
console.log("Automata created the ordered list of states is :");
automata.sort((a, b) => a[0].automaton!.state_number() - b[0].automaton!.state_number())
automata.forEach(a => console.log(a[0].automaton!.state_number()));

if (toWrite) {
  clearFile(fileName);
  writeToFile(fileName, csvHead);
}


for (let index = 0; index < automata.length; index++) {
  const [teacher, file] = automata[index];

  teacher.description = index + "";

  let L = new L_star(teacher),
    NL = new NL_star(teacher);

  console.log("=".repeat(90))
  console.error(index, "Current benchmark :", file, "With state number", teacher.automaton!.state_number());
  console.log(index, "Current benchmark :", file, "With state number", teacher.automaton!.state_number());

  console.log("In L*");

  L.make_all_queries();
  console.log(printInfo(L, "L*"));
  console.log("-".repeat(80));
  console.log("In NL*");
  NL.make_all_queries();
  console.log(printInfo(NL, "NL*"));

  console.log(printCsvCompare(L, NL));

  if (toWrite) writeToFile(fileName, printCsvCompare(L, NL))
}
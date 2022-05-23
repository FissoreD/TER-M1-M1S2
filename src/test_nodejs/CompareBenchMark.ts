import { readdirSync, readFileSync } from "fs";
import { clearFile, csvHead, printCsvCompare, printInfo, writeToFile } from "./PrintFunction.js";
import { TeacherAutomaton } from "../teacher/TeacherAutomaton.js";
import { L_star } from "../learners/L_star.js";
import { NL_star } from "../learners/NL_star.js";
import { Teacher } from "../teacher/Teacher.js";
import { Automaton } from "../automaton/Automaton.js";
import { myLog } from "../tools/Utilities.js";

let benchMark = true;

let path = ("./statistics/" + (benchMark ? "benchMark/" : "automata/")),
  fileName = benchMark ? "benchMark" : "randomAutomata",
  files = readdirSync(path),
  automata: [Teacher, string][] = [],
  minStateNb = 0,
  maxStateNb = 63,
  toWrite = false;

for (const underFolder of files) {
  myLog({ a: [underFolder] });
  if (!underFolder.startsWith("1.5")) continue

  let newPath = path + underFolder + "/";
  let files = readdirSync(newPath);
  for (const file of files) {
    if (!file.endsWith('.ba')) continue
    myLog({ a: ["=".repeat(90)] })
    console.error("Creating automaton of file", underFolder + "/" + file);
    myLog({ a: ["Creating automaton of file", underFolder + "/" + file] });
    let content = readFileSync(newPath + file).toString();
    let automaton = Automaton.strToAutomaton(content);
    let teacher = new TeacherAutomaton({ automaton: automaton, regex: underFolder + "/" + file })
    myLog({ a: ["State number is", "-".repeat(50), teacher.automaton.state_number()] })
    if (
      teacher.automaton.state_number() > minStateNb
      && teacher.automaton.state_number() < maxStateNb
    ) {
      automata.push([teacher, underFolder + "/" + file]);
      teacher.description = teacher.automaton.state_number() + ""
    }
  }
}
myLog({ a: [automata.map(e => e[1])] });

myLog({ a: ["=".repeat(90)] })
myLog({ a: ["Automata created the ordered list of states is :"] });
automata.sort((a, b) => a[0].automaton!.state_number() - b[0].automaton!.state_number())
automata.forEach(a => myLog({ a: [a[0].automaton!.state_number()] }));



if (toWrite) {
  clearFile(fileName);
  writeToFile(fileName, csvHead);
}


for (let index = 0; index < automata.length; index++) {
  const [teacher, file] = automata[index];

  let L = new L_star(teacher),
    NL = new NL_star(teacher);

  myLog({ a: ["=".repeat(90)] })
  console.error(file, "Current benchmark :", index, "/", automata.length, "With state number", teacher.automaton!.state_number());
  myLog({ a: [file, "Current benchmark :", index, "/", automata.length, "With state number", teacher.automaton!.state_number()], toLog: true });


  L.make_all_queries();

  console.error("In L*");
  myLog({ a: [printInfo(L, "L*")], toLog: true });


  NL.make_all_queries();

  myLog({ a: ["-".repeat(80)] });
  console.error("In NL*");
  myLog({ a: [printInfo(NL, "NL*")], toLog: true });

  if (L.consistence_counter > 1 && L.closedness_counter > 1 &&
    NL.consistence_counter > 1 && NL.closedness_counter > 1 &&
    L.equiv_number > NL.equiv_number && NL.equiv_number > 0) {
    myLog({ a: [printInfo(L, "L*")], toLog: true });
    myLog({ a: [printInfo(NL, "NL*")], toLog: true });
    myLog({ a: [printCsvCompare(L, NL)], toLog: true });
    break
  }

  if (toWrite) writeToFile(fileName, printCsvCompare(L, NL))
}
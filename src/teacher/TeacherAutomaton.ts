import { regexToAutomaton } from "../automaton/automaton_type.js";
import { TeacherTakingAut } from "./TeacherTakingAut.js";

export class TeacherAutomaton extends TeacherTakingAut {
  constructor(regex: string, description?: string) {
    super({ automaton: regexToAutomaton(regex), description: description, regex: regex })
    this.description = description || `Automaton accepting \\(regex(${regex})\\)`;
  }
}
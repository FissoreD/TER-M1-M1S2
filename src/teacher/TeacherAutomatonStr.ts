import { regexToAutomaton } from "../automaton/automaton_type.js";
import { TeacherAutomaton } from "./TeacherAutomaton.js";

/**
 * This Teacher takes an text representing an automaton as parameter :\
 * The text should be on the form :\
 * [initialStates]\
 * symbol, [stateA] -> [stateB]\
 * [finalStates]
 */
export class TeacherAutomatonStr extends TeacherAutomaton {
  constructor(regex: string, description?: string) {
    super({ automaton: regexToAutomaton(regex), description: description, regex: regex })
    this.description = description || `Automaton accepting L = regex(${regex})`;
  }
}
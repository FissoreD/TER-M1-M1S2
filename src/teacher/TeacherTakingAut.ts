import { boolToString } from "../tools/Utilities.js";
import { Automaton, State } from "../automaton/Automaton.js";
import { Teacher } from "./Teacher.js";
import { equivalenceFunction } from "./Equiv.js";
import { minimizeAutomaton, MyAutomatonToHis } from "../automaton/automaton_type.js";

export class TeacherTakingAut implements Teacher {
  description: string;
  alphabet: string[];
  regex: string;
  automaton: Automaton;
  counter_examples?: string[];

  constructor(params: { automaton: Automaton, description?: string, regex?: string, counter_examples?: string[] }) {
    this.automaton = minimizeAutomaton(MyAutomatonToHis(params.automaton));
    this.alphabet = params.automaton.alphabet;
    this.regex = params.regex || "Teacher with automaton"
    this.description = params.description || "";
    this.counter_examples = params.counter_examples;
  }

  /*
 * @param sentence the sentence to test the appartenance
 * @returns the string "0" if the sentence is accepted else "1"
 */
  member(sentence: string): string {
    return boolToString(this.automaton!.accept_word_nfa(sentence));
  }

  equiv(automaton: Automaton): string | undefined {
    return equivalenceFunction(this, automaton)
  }

}
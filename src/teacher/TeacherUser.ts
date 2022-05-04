import { boolToString } from "../tools/Utilities.js";
import { Automaton } from "../automaton/Automaton.js";
import { Teacher } from "./Teacher.js";

export class TeacherUser implements Teacher {
  description: string;
  alphabet: string[];
  counter_examples?: string[] | undefined;
  regex: string;
  automaton?: Automaton | undefined;

  constructor() {
    this.alphabet = Array.from(this.notNullPrompt("Enter your alphabet", "01"));
    this.description = "The teacher is the User and alphabet is [" + this.alphabet.join(',') + ']'
    this.regex = "";
  }

  member(sentence: string): string {
    return boolToString(confirm(`Does ${sentence.length > 0 ? sentence : 'ε'} belongs to your language ?`))
  }
  equiv(_automaton: Automaton): string | undefined {
    let isValid = confirm(`Does the displayed automaton recognize your language ?`)
    return isValid ? undefined : this.notNullPrompt("Enter a counter-exemple")
  }

  notNullPrompt(str: string, defaultValue?: string) {
    let alp: string | null = prompt(str, defaultValue);
    while (alp == null) {
      alp = prompt("You can't send empty string. Redo :", defaultValue);
    }
    return alp;
  }

}
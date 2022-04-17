import { Automaton } from "../automaton/Automaton.js";
import { boolToString, myFunction } from "../tools/Utilities.js";
import { equivalenceFunction } from "./Equiv.js";
import { Teacher } from "./Teacher.js";

export class TeacherNoAutomaton implements Teacher {
  static counter = 0;

  check_function: myFunction<string, boolean>;
  counter_examples: string[];
  counter: number;
  description: string;
  alphabet: string[];
  max_word_length = 8;
  regex: string;

  constructor(params: {
    regex: string | myFunction<string, boolean>, counter_examples: string[], alphabet:
    string[] | string
  }, description: string = "") {

    this.counter = 0;
    this.description = (typeof params.regex == 'string') ? "Automaton with regex : " + params.regex :
      // @ts-ignore
      `Teacher with function<br><pre> ${js_beautify(params.regex.toString())}</pre>`;
    this.alphabet = Array.from(params.alphabet);
    this.regex = (typeof params.regex == 'string') ? params.regex : "Teacher with function"

    this.check_function =
      (typeof params.regex == 'string') ?
        s => s.match(new RegExp(`^(${params.regex})$`)) != undefined :
        params.regex as myFunction<string, boolean>;

    this.counter_examples = params.counter_examples;
  }

  /*
  * @param sentence the sentence to test the appartenance
  * @returns the string "0" if the sentence is accepted else "1"
  */
  member(sentence: string): string {
    return boolToString(this.check_function(sentence));
  }

  equiv(automaton: Automaton): string | undefined {
    return equivalenceFunction(this, automaton);
  }

}
import { Automaton } from "../automaton/Automaton.js";
import { boolToString, myFunction } from "../tools/Utilities.js";
import { Teacher } from "./Teacher.js";

export class TeacherNoAutomaton implements Teacher {
  static counter = 0;

  check_function: myFunction<string, boolean>;
  counter_exemples: string[];
  counter: number;
  description: string;
  alphabet: string[] | string;
  max_word_length = 8;
  regex: string;

  constructor(params: {
    regex: string | myFunction<string, boolean>, counter_exemples: string[], alphabet:
    string[] | string
  }, description: string = "") {
    this.check_function = (typeof params.regex == 'string') ? s => s.match(new RegExp(`^(${params.regex})$`)) != undefined : params.regex as myFunction<string, boolean>;
    this.counter_exemples = params.counter_exemples;
    this.counter = 0;
    this.description = description;
    this.alphabet = params.alphabet;
    this.regex = params.regex.toString()
  }

  initiate_mapping() {
    let res: [string, boolean][] = [["", this.check_function!("")]]
    let alphabet = Array.from(this.alphabet).sort()
    let level = [""]
    while (res[res.length - 1][0].length < this.max_word_length) {
      let res1: string[] = []
      level.forEach(e => alphabet.forEach(a => {
        res.push([e + a, this.check_function!(e + a)])
        res1.push(e + a)
      }))
      level = res1
    }
    return res;
  }

  /*
  * @param sentence the sentence to test the appartenance
  * @returns the string "0" if the sentence is accepted else "1"
  */
  member(sentence: string): string {
    return boolToString(this.check_function(sentence));
  }

  equiv(automaton: Automaton): string | undefined {
    console.log("This 1");
    let acceptedByTeacher = this.counter_exemples.filter(e => this.check_function(e))
    // HERE OTHER PROBLEM
    console.log("This 2", automaton.state_number(), automaton.transition_number());
    let acceptedByLerner = this.counter_exemples.filter(e => automaton.accept_word_nfa(e))
    console.log("This 3");
    let symetricDifference = acceptedByLerner.filter(e => !acceptedByTeacher.includes(e)).
      concat(acceptedByTeacher.filter(e => !acceptedByLerner.includes(e)))
    console.log("This 4");
    return symetricDifference ? symetricDifference[0] : undefined;
  }

}
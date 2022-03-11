import { Automaton } from "../Automaton.js";
import { Teacher } from "../Teacher.js";
import { boolToString, generate_prefix_list } from "../Utilities.js";
import { LernerBase, Map_string_string } from "./LernerBase.js";

export class L_star extends LernerBase {

  constructor(teacher: Teacher) {
    super(teacher)
  }

  update_observation_table(key: string, value: string) {
    let old_value = this.observation_table[key];
    if (old_value != undefined) value = old_value + value
    this.observation_table[key] = value;
  }

  /**
   * 1. Takes a string in parameter and s in {@link S} and e in {@link E}  
   * 2. Asks to the {@link teacher} if question is accepted  
   * 3. Updates {@link observation_table} wrt the answer  
   * No modification is performed in {@link S}, {@link E} or {@link SA} sets
   */
  make_query(pref: string, suff: string) {
    let word = pref + suff;
    let answer: string;
    // If we know already the answer, we do not query the teacher
    for (let i = 0; i < word.length + 1; i++) {
      let pref1 = word.substring(0, i);
      let suff1 = word.substring(i);
      if (pref1 == pref) continue;
      if (this.E.includes(suff1)) {
        if ((this.S.includes(pref1) || this.SA.includes(pref1)) && this.observation_table[pref1]) {
          answer = this.observation_table[pref1].charAt(this.E.indexOf(suff1));
          this.update_observation_table(pref, answer)
          if (answer == undefined) throw 'Parameter is not a number!';
          return;
        }
      }
    }
    answer = this.teacher.query(word);
    this.update_observation_table(pref, answer)
    this.query_number++;
  }

  /**
   * Takes in parameter an {@link Automaton} and ask 
   * to the teacher if the automaton knows the language.
   * If so : the Lerner has learnt the language
   * Else : it appends the counter-exemple to {@link S}
   * @param a an Automaton
   */
  make_member(a: Automaton) {
    let answer = this.teacher.member(a);
    this.member_number++;
    return answer;
  }

  make_automaton() {
    let states: Map_string_string = {}
    this.S.forEach(e => states[this.observation_table[e]] = e);
    let first_state = this.observation_table[""];
    let keys = Object.keys(states);
    let end_states: string[] = keys.filter(k => k[0] == '1');
    let transitions = keys.map(
      (k) => this.alphabet.map(a => {
        return [this.observation_table[states[k] + a]]
      }));
    return new Automaton({
      "alphabet": this.alphabet,
      "endState": end_states,
      "startState": [first_state],
      "states": keys,
      "transitions": transitions
    })
  }


  /**
   * @returns the first t in SA st it does not exist s in S st row(s) == row (s.a)
   */
  is_close(): string | undefined {
    return this.SA.find(t => !this.S.some(s => this.same_row(s, t)));
  }

  /**
   * @returns a list of 3 elements, 
   * the first two are s1, s2 in {@link S} st row(s1) == row(s2)
   * and there is an "a" in alphabet st row(s1 + a) != row(s2 + a)
   */
  is_consistent(): string[] | undefined {
    for (let s1_ind = 0; s1_ind < this.S.length; s1_ind++) {
      for (let s2_ind = s1_ind + 1; s2_ind < this.S.length; s2_ind++) {
        let s1 = this.S[s1_ind];
        let s2 = this.S[s2_ind];
        if (this.same_row(s1, s2)) {
          for (const a of this.alphabet) {
            for (let i = 0; i < this.E.length; i++) {
              if (this.observation_table[s1 + a][i] !=
                this.observation_table[s2 + a][i])
                return [s1, s2, a + this.E[i]]
            }
          }
        }
      }
    }
  }

  same_row(a: string, b: string) {
    return this.observation_table[a] == this.observation_table[b];
  }
}
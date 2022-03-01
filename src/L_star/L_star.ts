// import { Observation_table } from "../L_star/Observation_table.js";
import { Automaton } from "../Automaton.js";
import { tableHTML } from "../Main.js";
import { Teacher } from "../Teacher.js";
import { generate_prefix_list } from "../Utilities.js";
export type Map_string_string = { [key: string]: string };

export class L_star {
  protected alphabet: string[];
  protected E: string[];
  protected S: string[];
  protected SA: string[];
  protected observation_table: Map_string_string;
  protected teacher: Teacher;

  constructor(alphabet: string, teacher: Teacher) {
    this.alphabet = Array.from(alphabet);
    this.teacher = teacher;
    this.E = [""];
    this.S = [""];
    this.SA = Array.from(alphabet);
    this.observation_table = {};
    this.make_query("", "");
    this.SA.forEach(elt => this.make_query(elt, ""));
  }

  update_observation_table(new_str: string, value: string) {
    let old_value = this.observation_table[new_str];
    if (old_value != undefined) value = old_value + value
    this.observation_table[new_str] = value;
  }

  /**
   * 1. Takes a string in parameter and s in {@link S} and e in {@link E}  
   * 2. Asks to the {@link teacher} if question is accepted  
   * 3. Updates {@link observation_table} wrt the answer
   */
  make_query(pref: string, suff: string) {
    var answer = this.teacher.query(pref + suff);
    this.update_observation_table(pref, answer)
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
    return answer;
  }

  /**
   * For all prefix p of {@link new_elt} if p is not in {@link S} :
   * remove p from {@link SA} and add it to {@link S}
   * @param new_elt the {@link new_elt} to add in {@link S}
   */
  add_elt_in_S(new_elt: string) {
    let prefix_list = generate_prefix_list(new_elt);
    for (const prefix of prefix_list) {
      if (this.S.includes(prefix)) return;
      if (this.SA.includes(prefix)) {
        this.move_from_SA_to_S(prefix);
        this.alphabet.forEach(a => {
          const new_word = prefix + a;
          if (!this.SA.includes(new_word) && !this.S.includes(new_word)) {
            this.E.forEach(e => this.make_query(new_word, e));
            this.SA.push(new_word);
          }
        })
      } else {
        this.E.forEach(e => this.make_query(prefix, e));
        this.S.push(prefix)
        this.alphabet.forEach(a => {
          this.SA.push(prefix + a)
          this.E.forEach(e => this.make_query(prefix + a, e));
        });
      }
    }
  }

  move_from_SA_to_S(elt: string) {
    const index = this.SA.indexOf(elt);
    if (index != -1) this.SA.splice(index, 1);
    this.S.push(elt);
  }

  add_column(col_name: string) {
    this.SA.forEach(t => this.make_query(t, col_name));
    this.S.forEach(s => {
      this.make_query(s, col_name)
    });
    this.E.push(col_name);
  }

  define_next_questions() {
    const close_rep = this.is_close();
    const consistence_rep = this.is_consistent()
    if (close_rep != undefined) {
      this.add_elt_in_S(close_rep);
    } else if (consistence_rep != undefined) {
      this.add_column(consistence_rep[2]);
    } else {
      return true;
    }
    return false;
  }

  make_automaton() {
    let states: Map_string_string = {}
    this.S.forEach(e => states[this.observation_table[e]] = e);
    let first_state = this.observation_table[""];
    let keys = Object.keys(states);
    let end_states: string[] = keys.filter(k => k[0] == '1');
    let ar = keys.map(
      (k) => this.alphabet.map(a => {
        return this.observation_table[states[k] + a]
      }));
    return new Automaton({
      "alphabet": this.alphabet,
      "endNodes": end_states,
      "startNode": first_state,
      "states": keys,
      "transitions": ar
    })
  }


  /**
   * @returns the first t in SA st it dows not exist s in S st row(s) == row (s.a)
   */
  is_close(): string | undefined {
    return this.SA.find(t => !this.S.some(s => this.same_row(s, t)));
  }

  /**
   * @returns if the {@link observation_table} is consistent
   */
  is_consistent(): string[] | undefined {
    for (let s1_ind = 0; s1_ind < this.S.length; s1_ind++) {
      for (let s2_ind = s1_ind + 1; s2_ind < this.S.length; s2_ind++) {
        let s1 = this.S[s1_ind];
        let s2 = this.S[s2_ind];
        if (this.same_row(s1, s2)) {
          let first_unmacth = this.alphabet.find(a => !this.same_row(s1 + a, s2 + a));
          if (first_unmacth != undefined)
            return [s1, s2, first_unmacth]
        }
      }
    }
  }

  same_row(a: string, b: string) {
    return this.observation_table[a] == this.observation_table[b];
  }
}
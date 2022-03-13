import { Automaton } from "../Automaton.js";
import { Teacher } from "../Teacher.js";
import { boolToString, generate_prefix_list } from "../tools/Utilities.js";

export type Map_string_string = { [key: string]: string };

export abstract class LernerBase {
  alphabet: string[];
  E: string[];
  S: string[];
  SA: string[];
  observation_table: Map_string_string;
  teacher: Teacher;
  query_number: number;
  member_number: number;
  finish = false;
  automaton: undefined | Automaton;

  constructor(teacher: Teacher) {
    this.alphabet = Array.from(teacher.alphabet);
    this.teacher = teacher;
    this.query_number = 0;
    this.member_number = 0;
    this.E = [""];
    this.S = [""];
    this.SA = Array.from(this.alphabet);
    this.observation_table = {};
    this.add_row("")
    this.SA.forEach(elt => this.add_row(elt));
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

  /**
   * For all prefix p of {@link new_elt} if p is not in {@link S} :
   * remove p from {@link SA} and add it to {@link S}
   * @param new_elt the {@link new_elt} to add in {@link S}
   * @returns the list of added elt in SA or S
   */
  add_elt_in_S(new_elt: string, after_member = false): string[] {
    let added_list: string[] = [];
    let prefix_list = generate_prefix_list(new_elt);
    for (const prefix of prefix_list) {
      if (this.S.includes(prefix)) return added_list;
      if (this.SA.includes(prefix)) {
        this.move_from_SA_to_S(prefix);
        this.alphabet.forEach(a => {
          const new_word = prefix + a;
          if (!this.SA.includes(new_word) && !this.S.includes(new_word)) {
            this.add_row(new_word, after_member);
            this.SA.push(new_word);
            added_list.push(new_word);
          }
        })
      } else {
        this.S.push(prefix);
        this.add_row(prefix, after_member);
        added_list.push(prefix);
        this.alphabet.forEach(a => {
          let new_word = prefix + a;
          if (!this.SA.includes(new_word) && !this.S.includes(new_word)) {
            this.SA.push(prefix + a);
            this.add_row(prefix + a)
            added_list.push(prefix + a)
          }
        });
      }
      after_member = false;
    }
    return added_list;
  }

  /**
   * @param row_name 
   * adds a row to the {@link observation_table} 
   * querying the teacher for all tuple ({@link row_name}, e) where e is in {@link E}
   * @see {@link make_query}
   */
  add_row(row_name: string, after_member = false) {
    this.E.forEach(e => {
      if (after_member && e == "")
        this.observation_table[row_name] = boolToString(!this.automaton!.accept_word_nfa(row_name)[0]);
      else this.make_query(row_name, e)
    });
  }

  move_from_SA_to_S(elt: string) {
    const index = this.SA.indexOf(elt);
    if (index != -1) this.SA.splice(index, 1);
    this.S.push(elt);
  }

  add_column(new_col: string) {
    let L = [this.SA, this.S];
    L.forEach(l => l.forEach(s => this.make_query(s, new_col)));
    this.E.push(new_col);
  }

  define_next_questions() {
    const close_rep = this.is_close();
    const consistence_rep = this.is_consistent()
    if (close_rep != undefined) {
      this.add_elt_in_S(close_rep);
    } else if (consistence_rep != undefined) {
      let new_col = consistence_rep[2]
      this.add_column(new_col);
    } else {
      return true;
    }
    return false;
  }

  abstract make_automaton(): Automaton;

  abstract is_close(): string | undefined;

  abstract is_consistent(): string[] | undefined;

  same_row(a: string, b: string) {
    return this.observation_table[a] == this.observation_table[b];
  }
}
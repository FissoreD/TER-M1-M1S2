import { Automaton } from "../automaton/Automaton.js";
import { Teacher } from "../teacher/Teacher.js";
import { boolToString, generate_prefix_list, generate_suffix_list } from "../tools/Utilities.js";

export type ObservationTable = { [key: string]: string };

export abstract class LearnerBase {
  alphabet: string[];
  E: string[];
  S: string[];
  SA: string[];
  observation_table: ObservationTable;
  teacher: Teacher;
  member_number: number;
  equiv_number: number;
  finish = false;
  automaton: undefined | Automaton;

  constructor(teacher: Teacher) {
    this.alphabet = Array.from(teacher.alphabet);
    this.teacher = teacher;
    this.member_number = 0;
    this.equiv_number = 0;
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
   * 1. Takes s in {@link S} and e in {@link E} which creating a word 
   * 2. Asks to the {@link teacher} if word is accepted  
   * 3. Updates {@link observation_table} wrt the answer  
   * No modification is performed in {@link S}, {@link E} or {@link SA} sets
   */
  make_member(pref: string, suff: string) {
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
    answer = this.teacher.member(word);
    this.update_observation_table(pref, answer)
    this.member_number++;
  }

  /**
   * Takes in parameter an {@link Automaton} and ask 
   * to the teacher if the automaton knows the language.
   * If so : the Learner has learnt the language
   * Else : it appends the counter-exemple to {@link S}
   * @param a an Automaton
   * @returns undefined if {@link a} recognize the teacher's language, a counter-exemple (as a string) otherwise.
   */
  make_equiv(a: Automaton) {
    let answer = this.teacher.equiv(a);
    this.equiv_number++;
    return answer;
  }

  /**
   * For all prefix p of {@link new_elt} if p is not in {@link S} :
   * remove p from {@link SA} and add it to {@link S}
   * @param new_elt the {@link new_elt} to add in {@link S}
   * @returns the list of added elt in SA or S
   */
  add_elt_in_S(new_elt: string, after_member = false): void {
    let added_list: string[] = [];
    let prefix_list = generate_prefix_list(new_elt);
    for (const prefix of prefix_list) {
      if (this.S.includes(prefix)) return;
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
    return;
  }


  /**
  * For all suffix suff of {@link new_elt} if suff is not in {@link E} :
  * add suff to {@link E} and make queries for every elt in {@link SA} and
  * {@link S} relating to the new column suff
  */
  add_elt_in_E(new_elt: string, after_equiv = false) {
    let suffix_list = generate_suffix_list(new_elt);
    for (const suffix of suffix_list) {
      if (this.E.includes(suffix)) break;
      this.SA.forEach(s => {
        if (s + suffix == new_elt && after_equiv)
          this.update_observation_table(s, boolToString(!this.automaton!.accept_word(new_elt)))
        else this.make_member(s, suffix)
      });
      this.S.forEach(s => {
        if (s + suffix == new_elt && after_equiv)
          this.update_observation_table(s, boolToString(!this.automaton!.accept_word(new_elt)))
        else this.make_member(s, suffix)
      });
      this.E.push(suffix);
    }
  }

  /**
   * @param row_name 
   * adds a row to the {@link observation_table} 
   * querying the teacher for all tuple ({@link row_name}, e) where e is in {@link E}
   * @see {@link make_member}
   */
  add_row(row_name: string, after_member = false) {
    this.E.forEach(e => {
      if (after_member && e == "")
        this.observation_table[row_name] = boolToString(!this.automaton!.accept_word_nfa(row_name));
      else this.make_member(row_name, e)
    });
  }

  move_from_SA_to_S(elt: string) {
    const index = this.SA.indexOf(elt);
    if (index != -1) this.SA.splice(index, 1);
    this.S.push(elt);
  }

  /**
   * The learner finds the next question according to 
   * current context
   */
  make_next_query() {
    if (this.finish) return;
    var close_rep;
    var consistence_rep;
    if (close_rep = this.is_close()) {
      this.add_elt_in_S(close_rep);
    } else if (consistence_rep = this.is_consistent()) {
      let new_col = consistence_rep[2]
      this.add_elt_in_E(new_col);
    } else {
      let automaton = this.make_automaton();
      this.automaton = automaton;
      let answer = this.make_equiv(automaton);
      if (answer != undefined) {
        this.table_to_update_after_equiv(answer!)
        this.automaton = undefined;
      } else {
        this.finish = true;
      }
    }
  }

  make_all_queries() {
    while (!this.finish) {
      this.make_next_query();
    }
  }

  /**
   * Every learner can update differently the observation table according to its implementation
   * @param answer the answer of teacher after equiv question
   */
  abstract table_to_update_after_equiv(answer: string): void;

  abstract make_automaton(): Automaton;

  abstract is_close(): string | undefined;

  abstract is_consistent(): string[] | undefined;

  same_row(a: string, b: string) {
    return this.observation_table[a] == this.observation_table[b];
  }
}
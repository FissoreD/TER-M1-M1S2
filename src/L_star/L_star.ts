// import { Observation_table } from "../L_star/Observation_table.js";
import { Automaton } from "../Automaton.js";
import { Teacher } from "../Teacher.js";
import { generate_prefix_list } from "../Utilities.js";
export type Map_string_string = { [key: string]: string };

export class L_star {
  private alphabet: string[];
  private E: string[];
  private S: string[];
  private SA: string[];
  private observation_table: Map_string_string;
  private teacher: Teacher;

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
    // console.log("Updating", new_str, "in", value);

    let old_value = this.observation_table[new_str];
    if (old_value != undefined) value = old_value + value
    // console.log("the new value is", value);
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
    if (answer != undefined) {
      this.add_elt_in_S(answer);
    }
  }

  /**
   * For all prefix p of {@link new_elt} if p is not in {@link S} :
   * remove p from {@link SA} and add it to {@link S}
   * @param new_elt the {@link new_elt} to add in {@link S}
   */
  add_elt_in_S(new_elt: string) {
    // let prefix_list = generate_prefix_list(new_elt);
    // for (const pref of prefix_list) {
    //   if (!this.S.includes(pref)) {
    //     console.log("Adding prefix ", pref, this.S);

    //     if (this.SA.includes(pref)) {
    //       this.S.push(this.observation_table[pref])
    //     } else {
    //       this.S.push(pref);
    //       for (const a of this.alphabet) {
    //         if (!this.SA.includes(pref + a)) {
    //           console.log("This is adding phase in SA", pref + a, this.SA);
    //           this.SA.push(pref + a);
    //           this.make_query(pref + a, "")
    //         }
    //       }
    //       for (const e of this.E) {
    //         this.make_query(pref, e)
    //       }
    //     }
    //     const index = this.SA.indexOf(pref);
    //     if (index != -1) this.SA.splice(index, 1);
    //     this.alphabet.forEach(a => {
    //       if (!this.S.includes(pref + a) && !this.SA.includes(pref + a)) {
    //         console.log("This is adding phase in SA", pref + a, this.SA);

    //         this.SA.push(pref + a);
    //         this.make_query(pref + a, "")
    //       }
    //     });
    //   } else break;
    // }

    let prefix_list = generate_prefix_list(new_elt);
    for (const prefix of prefix_list) {
      if (this.S.includes(prefix)) return;
      if (this.SA.includes(prefix)) {
        console.log("moving ", prefix, "from", this.SA, "to", this.S);

        this.move_from_SA_to_S(prefix);
        console.log(this.SA, this.S);

        this.alphabet.forEach(a => {
          const new_word = prefix + a;

          if (!this.SA.includes(new_word) && !this.S.includes(new_word)) {
            this.E.forEach(e => this.make_query(new_word, e));
            this.SA.push(new_word);
          }
        })
        console.log("And not sa is", this.SA);

      } else {
        console.log("In third branch analyzing", prefix);
        console.log("Atm S is", this.S, "SA", this.SA, this.SA.includes(prefix));


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
    console.log("Before \n", this.observation_table);
    console.log("SA", this.SA, "S", this.S, "alphabet", this.E);


    this.SA.forEach(t => this.make_query(t, col_name));
    this.S.forEach(s => {
      console.log("This is s", s);

      this.make_query(s, col_name)
    });
    console.log("After\n", this.observation_table);

    this.E.push(col_name);
  }

  define_next_questions() {
    const close_rep = this.is_close();
    const consistence_rep = this.is_consistent()

    // if there is an incongruence := this.close != undefined
    if (close_rep != undefined) {
      this.add_elt_in_S(close_rep);
    } else if (consistence_rep != undefined) {
      // console.log("Trying to add column", consistence_rep);

      this.add_column(consistence_rep);
    } else {
      return true;
    }
    return false;
  }

  make_automaton() {
    let states: Map_string_string = {}
    this.S.forEach(e => states[this.observation_table[e]] = e);
    let first_state = this.observation_table[""];
    let end_states: string[] = [];
    let keys = Object.keys(states);
    let ar = keys.map(
      (k) => this.alphabet.map(a => {
        return this.observation_table[states[k] + a]
      }));
    // let transitions: string[][] = new Array<Array<String>>(1 + states..length);
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
  is_consistent(): string | undefined {
    for (let s1_ind = 0; s1_ind < this.S.length; s1_ind++) {
      for (let s2_ind = s1_ind + 1; s2_ind < this.S.length; s2_ind++) {
        let s1 = this.S[s1_ind];
        let s2 = this.S[s2_ind];
        console.log(s1, s2);

        if (this.same_row(s1, s2)) {
          let first_unmacth = this.alphabet.find(a => {
            console.log(s1 + a, s2 + a, !this.same_row(s1 + a, s2 + a));

            return !this.same_row(s1 + a, s2 + a)
          });

          if (first_unmacth != undefined) {
            console.log("The first unmatch is caused by", first_unmacth, "between", s1, "and", s2);
            return first_unmacth
          };
        }
      }
    }
  }

  same_row(a: string, b: string) {
    // console.log(a, b, this.observation_table[a] == this.observation_table[b]);

    return this.observation_table[a] == this.observation_table[b];
  }
}
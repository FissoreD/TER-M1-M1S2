import { Automaton, State } from "../automaton/Automaton.js";
import { Teacher } from "../teacher/Teacher.js";
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

  make_automaton(): Automaton {
    let wordForState: string[] = [], states: Map<string, State> = new Map(),
      acceptingStates: State[] = [], initialStates: State[] = [];
    this.S.forEach(s => {
      let name = this.observation_table[s];
      if (!states.get(name)) {
        let state = new State(name, name[0] == "1", s == "", this.alphabet);
        wordForState.push(s);
        if (state.isAccepting) acceptingStates.push(state)
        if (state.isInitial) initialStates.push(state)
        states.set(name, state);
      }
    })

    for (const word of wordForState) {
      let name = this.observation_table[word]
      for (const symbol of this.alphabet) {
        states.get(name)!.transitions.get(symbol)!.push(states.get(this.observation_table[word + symbol])!)
      }
    }

    this.automaton = new Automaton(
      {
        states: states,
        acceptingStates: acceptingStates,
        alphabet: this.alphabet,
        initialStates: initialStates
      }
    )
    return this.automaton;
  }


  /**
   * @returns the first t in SA st it does not exist s in S st row(s) == row (t)
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
                this.observation_table[s2 + a][i] && !this.E.includes(a + this.E[i]))
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


  table_to_update_after_equiv(answer: string): void {
    this.add_elt_in_S(answer);
  }
}
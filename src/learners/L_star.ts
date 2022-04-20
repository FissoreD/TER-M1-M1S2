import { Automaton, State } from "../automaton/Automaton.js";
import { Teacher } from "../teacher/Teacher.js";
import { LearnerBase } from "./LearnerBase.js";

export class L_star extends LearnerBase {

  constructor(teacher: Teacher) {
    super(teacher)
  }

  make_automaton(): Automaton {
    let wordForState: string[] = [], statesMap: Map<string, State> = new Map(),
      acceptingStates: State[] = [], initialStates: State[] = [], statesSet: Set<State> = new Set();
    this.S.forEach(s => {
      let name = this.observation_table[s];
      if (!statesMap.get(name)) {
        let state = new State(name, name[0] == "1", s == "", this.alphabet);
        wordForState.push(s);
        if (state.isAccepting) acceptingStates.push(state)
        if (state.isInitial) initialStates.push(state)
        statesMap.set(name, state);
        statesSet.add(state)
      }
    })

    for (const word of wordForState) {
      let name = this.observation_table[word]
      for (const symbol of this.alphabet) {
        statesMap.get(name)!.outTransitions.get(symbol)!.push(statesMap.get(this.observation_table[word + symbol])!)
      }
    }

    this.automaton = new Automaton(statesSet)
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

  table_to_update_after_equiv(answer: string): void {
    this.add_elt_in_S(answer);
  }
}
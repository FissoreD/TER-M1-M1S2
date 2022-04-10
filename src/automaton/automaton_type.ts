
// @ts-nocheck
import { Automaton, AutomatonJson } from "../automaton/Automaton.js";
import { noam } from '../../public/noam.js';

interface HisTransition {
  fromState: number,
  toStates: number[],
  symbol: string
}

interface HisAutomaton {
  alphabet: string[],
  initialState?: number | number[],
  states: number[],
  transitions: HisTransition[],
  acceptingStates: number[]
}

export function HisAutomaton2Mine(aut: HisAutomaton): Automaton {
  let res: AutomatonJson = {
    alphabet: Array.from(aut.alphabet),
    acceptingStates: aut.acceptingStates.map(e => e + ""),
    startState: (typeof aut.initialState === "number") ? [aut.initialState + ""] : Array.from(aut.initialState!).map(e => e + ""),
    states: aut.states.map(e => e + ""),
    transitions: aut.transitions.map(e => ({ fromState: e.fromState + "", symbol: e.symbol, toStates: e.toStates.map(e => e + "") }))
  }
  return new Automaton(res);
}

export function MyAutomatonToHis(aut: Automaton): HisAutomaton {
  let state2int = (state: string) => aut.states.indexOf(state);
  let states = aut.states.map(e => state2int(e))
  let startState = states.length;
  let transitions = aut.transitions.map(e => ({
    fromState: state2int(e.fromState), symbol: e.symbol, toStates: e.toStates.map(e => state2int(e))
  }))
  if (aut.startState.length > 1) {
    transitions.push(({
      fromState: startState,
      symbol: "$",
      toStates: aut.startState.map(e => state2int(e))
    }));
    states.push(startState)
  } else startState = state2int(aut.startState[0])
  let res: HisAutomaton = {
    acceptingStates: aut.acceptingStates.map(e => state2int(e)),
    alphabet: Array.from(aut.alphabet),
    states: states,
    initialState: startState,
    transitions: transitions
  }
  return res;
}

export function regexToAutomaton(regex: string): Automaton {
  let res = noam.fsm.minimize(noam.re.string.toAutomaton(regex));
  return HisAutomaton2Mine(res);
}

export function minimizeAutomaton(automaton: HisAutomaton): Automaton {
  // automaton = noam.fsm.convertEnfaToNfa(automaton);
  // automaton = noam.fsm.convertNfaToDfa(automaton);
  // // HELP PROFESSORI
  // automaton = noam.fsm.minimize(automaton);
  // let myAutomaton = HisAutomaton2Mine(noam.fsm.convertStatesToNumbers(automaton));
  // console.log(myAutomaton.matrix_to_mermaid());
  // let minimized = myAutomaton.minimize()
  // console.log("-".repeat(50));
  // console.log(JSON.stringify(automaton, null, 4));

  // console.log(minimized.matrix_to_mermaid());
  // console.log("=".repeat(50));
  console.log("1");
  let hisMinimized = noam.fsm.minimize(automaton)
  console.log("2");
  let statesToNumbers = noam.fsm.convertStatesToNumbers(hisMinimized)
  console.log("3");
  let minimized = HisAutomaton2Mine(statesToNumbers)
  console.log("4");
  return minimized
}

export function intersectionAutomata(a1: Automaton, a2: Automaton): Automaton {
  return minimizeAutomaton(noam.fsm.intersection(MyAutomatonToHis(a1), MyAutomatonToHis(a2)))
}

export function unionAutomata(a1: Automaton, a2: Automaton): Automaton {
  let A1 = MyAutomatonToHis(a1);
  let A2 = MyAutomatonToHis(a2);
  let U: HisAutomaton = noam.fsm.union(A1, A2);
  let res = minimizeAutomaton(U)
  return res
}

export function complementAutomata(a1: Automaton): Automaton {
  return minimizeAutomaton(noam.fsm.complement(MyAutomatonToHis(a1)))
}

export function differenceAutomata(a1: Automaton, a2: Automaton): Automaton {
  let c = complementAutomata(a2);
  return intersectionAutomata(a1, c)
}
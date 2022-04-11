import { Automaton, AutomatonJson, State } from "../automaton/Automaton.js";
// @ts-ignore
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

  let states: State[] = aut.states.map(
    e => new State(
      e + "",
      aut.acceptingStates.map(e => e + "").includes(e + ""),
      (typeof aut.initialState == "number" ? aut.initialState + "" == e + "" : aut.initialState?.map(e => e + "").includes(e + "")) || false,
      aut.alphabet))

  let statesMap: Map<string, State> = new Map()
  for (const state of states) {
    statesMap.set(state.name, state)
  }

  for (const transition of aut.transitions) {
    let from = transition.fromState
    let symbol = transition.symbol
    let to = transition.toStates
    to.forEach(state =>
      statesMap.get(from + "")?.addTransition(symbol, statesMap.get(state + "")!))
  }

  let res: AutomatonJson = {
    alphabet: Array.from(aut.alphabet),
    initialStates: states.filter(s => s.isInitial),
    acceptingStates: states.filter(s => s.isAccepting),
    states: statesMap,
  }
  return new Automaton(res);
}

export function MyAutomatonToHis(aut: Automaton): HisAutomaton {
  let stateList = Array.from(aut.states).map(e => e[1]);
  let state2int = (state: State) => stateList.indexOf(state);
  let states = stateList.map(e => state2int(e))
  let startState = states.length;
  let transitions: HisTransition[] = stateList.map(state => Array.from(state.transitions).map(transition =>
  ({
    fromState: state2int(state),
    symbol: transition[0],
    toStates: transition[1].map(e => state2int(e))
  })).flat()).flat();
  //   )) aut.transitions.map(e => ({
  //   fromState: state2int(e.fromState), symbol: e.symbol, toStates: e.toStates.map(e => state2int(e))
  // }))
  if (aut.initialStates.length > 1) {
    transitions.push(({
      fromState: startState,
      symbol: "$",
      toStates: aut.initialStates.map(e => state2int(e))
    }));
    states.push(startState)
  } else startState = state2int(aut.initialStates[0])
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
  // console.log("1");
  let hisMinimized = noam.fsm.minimize(automaton)
  // console.log("2");
  let statesToNumbers = noam.fsm.convertStatesToNumbers(hisMinimized)
  // console.log("3");
  let minimized = HisAutomaton2Mine(statesToNumbers)
  // console.log("4");
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
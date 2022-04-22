import { Automaton, AutomatonJson, State } from "../automaton/Automaton.js";
// @ts-ignore
import { noam } from '../../public/noam.js';

interface HisTransition {
  fromState: number | number[],
  toStates: number[] | number[][],
  symbol: string
}

interface HisAutomaton {
  alphabet: string[],
  initialState?: number | number[],
  states: number[],
  transitions: HisTransition[],
  acceptingStates: number[] | number[][]
}

export function HisAutomaton2Mine(aut: HisAutomaton): Automaton {

  let states: State[] = aut.states.map(
    e => new State(
      e + "",
      aut.acceptingStates.some(x => x + "" == e + ""),
      (typeof aut.initialState == "number" ? aut.initialState + "" == e + "" : aut.initialState?.some(x => x + "" == e + "")) || false,
      aut.alphabet))

  let statesMap: Map<string, State> = new Map(),
    statesSet: Set<State> = new Set();
  for (const state of states) {
    statesMap.set(state.name, state)
    statesSet.add(state)
  }

  for (const transition of aut.transitions) {
    let from = transition.fromState
    let symbol = transition.symbol
    let to = transition.toStates
    to.forEach(state =>
      statesMap.get(from + "")?.addTransition(symbol, statesMap.get(state + "")!))
  }

  return new Automaton(statesSet);
}

export function MyAutomatonToHis(aut: Automaton): HisAutomaton {
  let stateList = Array.from(aut.states).map(e => e[1]);
  let state2int = (state: State) => stateList.indexOf(state);
  let states = stateList.map(e => state2int(e))
  let startState = states.length;
  let transitions: HisTransition[] = stateList.map(state => Array.from(state.outTransitions).map(transition =>
  ({
    fromState: state2int(state),
    symbol: transition[0],
    toStates: transition[1].map(e => state2int(e))
  })).flat()).flat();
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

/** Return the mDFA for a regex */
export function regexToAutomaton(regex: string): Automaton {
  let res = noam.re.string.toAutomaton(regex);
  return minimizeAutomaton(res);
}

export function minimizeAutomaton(automatonInput: HisAutomaton | Automaton): Automaton {
  let automaton = automatonInput instanceof Automaton ?
    MyAutomatonToHis(automatonInput) : automatonInput

  let log = (message: string, aut: HisAutomaton | Automaton) => {
    console.log(message, automaton.states.length);
    if ((aut instanceof Automaton ? aut.state_number() : aut.states.length) > 5000)
      console.error(message, automaton.states.length);
  }

  log("1 - Converting Enfa to NFA", automaton);
  automaton = noam.fsm.convertEnfaToNfa(automaton);
  log("2 - Converting NFA to DFA", automaton);
  automaton = noam.fsm.convertNfaToDfa(automaton);
  log("3 - Converting state to numbers ", automaton);

  let numToList = (elt: number | number[]) => typeof elt == 'number' ? [elt] : elt!
  try {
    let statesToNumbers = HisAutomaton2Mine(noam.fsm.convertStatesToNumbers(automaton))
    log("4 - Minimizing automaton ", statesToNumbers);
    let minimized = statesToNumbers.minimize()
    log("5 - Minimization OK, ", minimized);
    return minimized
  } catch {
    throw 'Error'
  }
}

export function intersectionAutomata(a1: Automaton, a2: Automaton): Automaton {
  console.log("Intersection, ", a1.states.size, a2.states.size);
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
  return HisAutomaton2Mine(noam.fsm.complement(MyAutomatonToHis(minimizeAutomaton(MyAutomatonToHis(a1)))))
}

export function differenceAutomata(a1: Automaton, a2: Automaton): Automaton {
  let c = complementAutomata(a2);
  return intersectionAutomata(a1, c)
}
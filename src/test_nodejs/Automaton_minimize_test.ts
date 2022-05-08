import { myLog } from "../tools/Utilities.js";
import { Automaton, State } from "../automaton/Automaton.js";


let state1 = new State("0", false, true, ['a', 'b'])
let state2 = new State("1", true, false, ['a', 'b'])
let state3 = new State("2", true, false, ['a', 'b'])
state1.addTransition('a', state2)
state2.addTransition('a', state3)

let a: Automaton = new Automaton(new Set([state1, state2, state3]))

myLog({ a: [a.matrix_to_mermaid()] });

myLog({ a: ["-".repeat(70)] });

myLog({ a: [a.minimize().matrix_to_mermaid()] });
myLog({ a: [] });
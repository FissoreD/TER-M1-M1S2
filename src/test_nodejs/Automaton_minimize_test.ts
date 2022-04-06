// import { intersectionAutomata, minimizeAutomaton, regexToAutomaton } from "../automaton/automaton_type.js";

import { Automaton } from "../automaton/Automaton.js";



let a: Automaton = new Automaton({
  acceptingStates: ["0", "1"],
  alphabet: ["a"],
  startState: ["0"],
  states: ["0", "1"],
  transitions: [
    {
      fromState: "0",
      symbol: "a",
      toStates: ["1"]
    }
  ]
})


console.log(JSON.stringify(a, null, 4));
console.log("-".repeat(50));
console.log(JSON.stringify(a.minimize(), null, 4));

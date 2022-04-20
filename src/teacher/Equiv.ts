import { differenceAutomata } from "../automaton/automaton_type.js";
import { MyAutomatonToHis } from "../automaton/automaton_type.js";
import { minimizeAutomaton } from "../automaton/automaton_type.js";
import { Automaton, State } from "../automaton/Automaton.js";
import { Teacher } from "./Teacher.js";
import { boolToString } from "../tools/Utilities.js";

export let equivalenceFunction = (teacher: Teacher, automaton: Automaton): string | undefined => {
  if (teacher.counter_examples) {
    for (const counter_example of teacher.counter_examples) {
      if (teacher.member(counter_example) !=
        boolToString(automaton.accept_word_nfa(counter_example)))
        return counter_example;
    }
  } else {
    let counterExemple = (automatonDiff: Automaton): string | undefined => {
      let stateList = automatonDiff.allStates
      if (automatonDiff.acceptingStates.length == 0) return undefined;
      let toExplore = Array.from(automatonDiff.initialStates)
      let explored: State[] = []
      type parentChild = { parent: State | undefined, symbol: string }
      let parent: parentChild[] = new Array(stateList.length).fill({ parent: undefined, symbol: "" });
      while (toExplore.length > 0) {
        const current = toExplore.shift()!
        if (explored.includes(current)) continue;
        explored.push(current)
        for (const [symbol, states] of current.outTransitions) {
          if (!explored.includes(states[0])) {
            parent[stateList.indexOf(states[0])] =
              { parent: current, symbol: symbol }
            if (!toExplore.includes(states[0])) toExplore.push(states[0])
          }
        }


        if (automatonDiff.acceptingStates.includes(current)) {
          let id = stateList.indexOf(current);
          let res: string[] = [parent[id].symbol]
          while (parent[id].parent) {
            id = stateList.indexOf(parent[id].parent!)
            res.push(parent[id].symbol)
          }
          return res.reverse().join("");
        }
      }
      return "";
    }
    let automMinimized = minimizeAutomaton(MyAutomatonToHis(automaton));
    let diff1 = differenceAutomata(teacher.automaton!, automMinimized);

    let counterEx1 = counterExemple(diff1);
    if (counterEx1) return counterEx1;

    let diff2 = differenceAutomata(automMinimized, teacher.automaton!);

    let counterEx2 = counterExemple(diff2);
    return counterEx2;
    // BREAKPOINT AFTER DIFF 
    // console.log("Counter * Exemples");

    // AFTER COUNTEREXEMPLE
    // console.log(`C1 = { ${counterEx1} }, C2 = { ${counterEx2} }`, automaton.state_number());

    // if (counterEx1 == undefined) return counterEx2;
    // if (counterEx2 == undefined) return counterEx1;
    // return counterEx1 < counterEx2 ? counterEx1 : counterEx2;
  }
}
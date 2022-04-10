import { differenceAutomata, minimizeAutomaton, MyAutomatonToHis, regexToAutomaton } from "../automaton/automaton_type.js";
import { Automaton } from "../automaton/Automaton.js";
import { Teacher } from "./Teacher.js";
import { boolToString } from "../tools/Utilities.js";

export class TeacherAutomaton implements Teacher {

  alphabet: string[] | string;
  regex: string;
  description: string;
  automaton: Automaton;

  constructor(regex: string, description?: string) {
    this.automaton = regexToAutomaton(regex);
    this.alphabet = this.automaton.alphabet;
    this.regex = regex;
    this.description = description || `Automata accepting \\(regex(${regex}$)\\)`;
  }

  /*
  * @param sentence the sentence to test the appartenance
  * @returns the string "0" if the sentence is accepted else "1"
  */
  member(sentence: string): string {
    return boolToString(this.automaton!.accept_word_nfa(sentence)[0]);
  }

  equiv(automaton: Automaton): string | undefined {
    let counterExemple = (automatonDiff: Automaton): string | undefined => {
      if (automatonDiff.acceptingStates.length == 0) return undefined;
      let toExplore = [automatonDiff.startState[0]]
      let explored: string[] = []
      type parentChild = { parent: string, symbol: string }
      let parent: parentChild[] = new Array(automatonDiff.states.length).fill({ parent: "", symbol: "" });
      while (toExplore.length > 0) {
        let current = toExplore.shift()!
        if (explored.includes(current)) continue;
        explored.push(current)
        for (const transition of automatonDiff.transitions) {
          if (!explored.includes(transition.toStates[0]) && transition.fromState == current) {
            parent[automatonDiff.states.indexOf(transition.toStates[0])] =
              { parent: transition.fromState, symbol: transition.symbol }
            toExplore.push(transition.toStates[0])
          }
        }

        if (automatonDiff.acceptingStates.includes(current)) {
          let id = automatonDiff.states.indexOf(current);
          let res: string[] = [parent[id].symbol]
          while (parent[id].parent != "") {
            id = automatonDiff.states.indexOf(parent[id].parent)
            res.push(parent[id].symbol)
          }
          return res.reverse().join("");
        }
      }
      return "";
    }
    let automMinimized = minimizeAutomaton(MyAutomatonToHis(automaton));
    let diff1 = differenceAutomata(this.automaton!, automMinimized);
    let diff2 = differenceAutomata(automMinimized, this.automaton!);
    // BREAKPOINT AFTER DIFF 
    let counterEx1 = counterExemple(diff1);
    let counterEx2 = counterExemple(diff2);
    // AFTER COUNTEREXEMPLE
    // console.log(`C1 = { ${counterEx1} }, C2 = { ${counterEx2} }`);

    if (counterEx1 == undefined) return counterEx2;
    if (counterEx2 == undefined) return counterEx1;
    return counterEx1! < counterEx2! ? counterEx1 : counterEx2;
  }

}
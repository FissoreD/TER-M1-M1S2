import { minimizeAutomaton } from "../automaton/automaton_type.js";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "fs";
import { Automaton, State } from "../automaton/Automaton.js";
import { myLog } from "../tools/Utilities.js";

/**
 * The goal of this file is to create random 
 * minimized automaton and store them in "./statistics/automata/"
 * folder. Every folder will have a {@link maxFilePerFolder} and
 * the max number of state of a minimized automaton will be:
 * {@link maxAutomatonStates}
 */

let path = "./statistics/automata/",
  iterationNumber = 5000,
  minStateNumber = 10,
  maxStateNumber = 350,
  maxFilePerFolder = 40,
  maxAutomatonStates = 200,
  folders = new Set(new Array(maxAutomatonStates).fill(1).map((_, pos) => pos + 1));

const randInt = (max: number) => {
  let res = Math.floor(Math.random() * max)
  return res;
}

const reachableFromState = (s: State) => {
  let l: Set<State> = new Set();
  let toExplore: State[] = [s];
  while (toExplore.length > 0) {
    let shift = toExplore.pop()!;
    let neigh = new Set(s.alphabet.map(e => shift.getSuccessor(e)).flat());
    for (const state of neigh) {
      if (!l.has(state)) {
        l.add(state);
        toExplore.push(state);
      }
    }
  }
  return Array.from(l);
}

for (let stateNumber = minStateNumber; stateNumber < maxStateNumber; stateNumber += 10) {
  if (folders.size == 0) break;
  myLog({ a: ["Iteration =", stateNumber, "Folder to fill :", folders.size] });

  for (let counter = 0; counter < iterationNumber; counter++) {
    if (folders.size == 0) break;
    const states: State[] = [];
    for (let i = 0; i < stateNumber; i++) {
      states.push(new State(i + '', false, false, 'ab'));
    }

    for (const state of states) {
      state.addTransition('a', states[randInt(stateNumber)])
      state.addTransition('b', states[randInt(stateNumber)])
    }


    let newInitial = states[randInt(stateNumber)];
    newInitial.isInitial = true
    let reachable = reachableFromState(newInitial)

    for (let i = 0; i < randInt(reachable.length); i++) {
      reachable[randInt(reachable.length)].isAccepting = true
    }

    let automaton = new Automaton(states),
      minimized = automaton.minimize(),
      folderName = minimized.state_number();

    if (folderName > maxAutomatonStates) continue;

    if (!existsSync(path + folderName)) mkdirSync(path + folderName);

    let dirElementNb = readdirSync(path + folderName).length;

    if (dirElementNb > maxFilePerFolder) {
      folders.delete(folderName);
      continue;
    }

    writeFileSync(path + folderName + "/" + dirElementNb + ".ba", minimized.toString());
    myLog({ a: ["State Number =", stateNumber, "Counter =", counter, "StateNb =", folderName] });
  }
}
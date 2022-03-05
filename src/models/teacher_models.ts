import { AutomatonJson } from "../Automaton";

export let even_zero_one: AutomatonJson = {
  "transitions": [
    ["q1", "q0"],
    ["q1", "q0"],
    ["q0", "q0"]
  ],
  "startNode": "q0",
  "endNodes": ["q1"],
  "alphabet": "10",
  "states": ["q0", "q1", "q3"]
}
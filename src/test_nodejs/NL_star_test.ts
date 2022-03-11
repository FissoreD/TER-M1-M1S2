import { Automaton } from "../Automaton.js";
import { aut } from "../models/automata.js";
import { NL_star } from "../lerners/NL_star.js";
import { teacherA3fromLast, teacherEvenAandThreeB, teacherPairZeroAndOne } from "../Teacher.js";

let graphic = false;

let lerner = new NL_star(teacherA3fromLast)

if (false) {
  lerner.observation_table = {
    "": "0100",
    "a": "0110",
    "b": "0100",
    "ab": "0101",
    "aa": "0111"
  }

  console.log(lerner);
  lerner.check_prime_lines();
  console.log(lerner);
} else {
  for (let i = 0; i < 30; i++) {
    console.log(`/ ************* STEP ${i + 1} ************* /`);
    lerner.check_prime_lines();
    if (lerner.define_next_questions()) {
      console.log("Making automaton :");
      let automaton = lerner.make_automaton();
      if (graphic) {
        console.log(automaton.initiate_graph());
      }
      console.log(automaton);
      let answer = lerner.make_member(automaton);
      if (answer != undefined) {
        lerner.add_elt_in_E(answer);
      }
      console.log("After member function : \n", lerner);

    } else {
      console.log(lerner);
    }
  }
}

console.log(new Automaton(aut).matrix_to_mermaid());

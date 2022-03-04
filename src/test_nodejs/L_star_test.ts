import { listener_automaton_click_button } from "../html_interactions/listeners.js";
import { L_star } from "../L_star/L_star.js";
import { teacherPairZeroAndOne } from "../Teacher.js";

let graphic = false;

let lerner = new L_star("01", teacherPairZeroAndOne)

console.log(lerner);

for (let i = 0; i < 6; i++) {
  console.log(`/ ************* STEP ${i + 1} ************* /`);

  if (lerner.define_next_questions()) {
    console.log("Making automaton :");
    let automaton = lerner.make_automaton();
    if (graphic) {
      console.log(automaton.initiate_graph());
      listener_automaton_click_button(automaton);
    }
    console.log(automaton);
    let answer = lerner.make_member(automaton);
    if (answer != undefined) {
      lerner.add_elt_in_S(answer);
    }
    console.log("After member function : \n", lerner);

  } else {
    console.log(lerner);
  }
}


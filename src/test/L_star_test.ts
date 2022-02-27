import { L_star } from "../L_star/L_star.js";
import { Teacher } from "../Teacher.js";
import { listener_automaton_click_button } from "../Utilities.js";

let graphic = true;

let lerner = new L_star("01", new Teacher())

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
    lerner.make_member(automaton);
    console.log("After member function : \n", lerner);

  } else {
    console.log(lerner);
  }
}


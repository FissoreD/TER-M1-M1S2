import { automatonDiv } from "../Main.js";
import { Teacher } from "../Teacher.js";
import { L_star } from "../lerners/L_star.js";
import { HTML_LernerBase } from "./HTML_LernerBase.js";

export class HTML_L_star extends HTML_LernerBase<L_star> {
  constructor(teacher: Teacher) {
    super(new L_star(teacher));
  }

  add_automaton_listener() {
    let input = document.createElement("input");
    let setB = document.createElement("button");
    setB.innerHTML = "Reinitialize automaton";
    setB.addEventListener('click', () => {
      this.automaton!.restart();
      this.automaton!.initiate_graph();
    })
    let sendB = document.createElement("button")
    sendB.innerHTML = "Next char";
    sendB.addEventListener('click', () => {
      this.automaton!.draw_next_step(input.value[0])
      input.value = input.value.slice(1);
    });
    automatonDiv.appendChild(input);
    automatonDiv.appendChild(sendB);
    automatonDiv.appendChild(setB);
    let acceptB = document.createElement("button");
    let answerP = document.createElement("p");
    acceptB.innerHTML = "In automaton";
    acceptB.addEventListener("click", () => {
      let aut_answer = this.automaton?.accept_word_nfa(input.value);
      if (aut_answer![0]) {
        answerP.innerHTML = `The word ${input.value} is accepted, here is a valid path : ${aut_answer![1]}`
      } else {
        answerP.innerHTML = `There is no valid path accepting the word ${input.value}`
      }
    })
    automatonDiv.appendChild(acceptB);
    automatonDiv.appendChild(answerP);
  }

  close_message(close_rep: string) {
    return `The table is not closed since
        \\(\\{row(${close_rep}) = ${this.lerner.observation_table[close_rep]} \\land 0 \\in SA\\}\\) but \\(\\{\\nexists s \\in S | row(s) = ${this.lerner.observation_table[close_rep]}\\}\\);
        I'm going to move ${close_rep} from SA to S`
  }

  consistent_message(s1: string, s2: string, new_col: string) {
    return `The table is not consistent : 
        \\(\\{row(${s1 ? s1 : "ε"}) = row(${s2 ? s2 : "ε"}) \\land (${s1 ? s1 : "ε"}, ${s2 ? s2 : "ε"}) \\in S\\}\\),
        but \\(\\{row(${s1 + new_col[0]}) \\neq row(${s2 + new_col[0]}) \\land (${s1 ? s1 : "ε"}, ${s2 ? s2 : "ε"}) \\in S \\land ${new_col[0]} \\in \\Sigma\\}\\)
        I'm going to add the column "${new_col}" since \\(T(${s1 + new_col}) \\neq T(${s2 + new_col})\\)`
  }

  table_to_update_after_equiv(answer: string) {
    this.lerner.add_elt_in_S(answer!, true);
  }
}
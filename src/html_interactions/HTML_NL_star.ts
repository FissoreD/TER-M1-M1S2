import { automatonDiv } from "../Main.js";
import { Teacher } from "../Teacher.js";
import { NL_star } from "../lerners/NL_star.js";
import { HTML_LernerBase } from "./HTML_LernerBase.js";

export class HTML_NL_star extends HTML_LernerBase<NL_star> {
  constructor(teacher: Teacher) {
    super(new NL_star(teacher));
  }

  add_row_html(
    parent: HTMLTableSectionElement, fst: string | undefined, head: string | undefined,
    row_elts: string[], colspan: number = 1, rowspan: number = 1
  ) {
    let row = super.add_row_html(parent, fst, head, row_elts, colspan, rowspan);
    if (head != undefined && this.lerner.prime_lines.includes(head)) {
      row.className += "prime-row"
    }
    return row;
  }

  add_automaton_listener() {
    let input = document.createElement("input");
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
    automatonDiv.appendChild(input);
    automatonDiv.appendChild(acceptB);
    automatonDiv.appendChild(answerP);
  }

  close_message(close_rep: string) {
    return `The table is not closed since
        \\(\\{row(${close_rep}) = ${this.lerner.observation_table[close_rep]} \\land ${close_rep} \\in SA\\}\\) but \\(\\{\\nexists s \\in S | row(s) \\sqsupseteq ${this.lerner.observation_table[close_rep]}\\}\\);
        I'm going to move "${close_rep}" from SA to S`
  }

  consistent_message(s1: string, s2: string, new_col: string) {
    return `The table is not consistent :
        take \\(${s1 ? s1 : "ε"}\\in S \\land ${s2 ? s2 : "ε"} \\in S \\land ${new_col[0]} \\in \\Sigma \\)
        \\(\\{row(${s1 ? s1 : "ε"}) \\sqsubseteq row(${s2 ? s2 : "ε"})\\}\\)
        but \\(\\{row(${s1 ? s1 : "ε"} \\circ ${new_col[0]}) \\not\\sqsubseteq row(${s2 ? s2 : "ε"} \\circ ${new_col[0]})\\}\\)
        I'm going to add the column \\(${new_col} \\in \\Sigma \\circ E\\) since \\(T(${s1 ? s1 : "ε"} \\circ ${new_col}) > T(${s2 ? s2 : "ε"} \\circ ${new_col})\\)`
  }

  table_to_update_after_equiv(answer: string): void {
    this.lerner.add_elt_in_E(answer!);
  }
}
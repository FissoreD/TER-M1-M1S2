import { Teacher } from "../teacher/Teacher.js";
import { L_star } from "../learners/L_star.js";
import { HTML_LearnerBase } from "./HTML_LearnerBase.js";

export class HTML_L_star extends HTML_LearnerBase<L_star> {
  constructor(teacher: Teacher) {
    super(new L_star(teacher));
  }

  close_message(close_rep: string) {
    let row = this.learner.observation_table[close_rep]
    return `The table is not closed since there is row(${close_rep}) = "${row}" where "${close_rep}" is in SA and "${row}" is not present in S. 
    "${close_rep}" will be moved from SA to S.`
  }

  consistent_message(s1: string, s2: string, new_col: string) {
    let fstChar = new_col[0],
      sndChar = new_col.length == 1 ? "ε" : new_col.substring(1);
    return `The table is not consistent since :
        row(${s1 ? s1 : "ε"}) = row(${s2 ? s2 : "ε"}) where ${s1 ? s1 : "ε"}, ${s2 ? s2 : "ε"} ∈ S but row(${s1 + new_col[0]}) ≠ row(${s2 + new_col[0]});
        The column "${new_col}" will be added in E since T(${s1 + new_col}) ≠ T(${s2 + new_col}) 
        [Note : ${new_col} = ${fstChar} ∘ ${sndChar} and ${fstChar} ∈ Σ and ${sndChar} ∈ E]`
  }

  table_to_update_after_equiv(answer: string) {
    this.learner.add_elt_in_S(answer!, true);
  }
}
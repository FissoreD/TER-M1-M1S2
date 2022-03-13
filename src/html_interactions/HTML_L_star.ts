import { Teacher } from "../Teacher.js";
import { L_star } from "../lerners/L_star.js";
import { HTML_LernerBase } from "./HTML_LernerBase.js";

export class HTML_L_star extends HTML_LernerBase<L_star> {
  constructor(teacher: Teacher) {
    super(new L_star(teacher));
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
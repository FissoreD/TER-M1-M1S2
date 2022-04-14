import{L_star}from"../learners/L_star.js";import{HTML_LearnerBase}from"./HTML_LearnerBase.js";export class HTML_L_star extends HTML_LearnerBase{constructor(teacher){super(new L_star(teacher))}close_message(close_rep){return`The table is not closed since
        \\(\\{row(${close_rep}) = ${this.learner.observation_table[close_rep]} \\land 0 \\in SA\\}\\) but \\(\\{\\nexists s \\in S | row(s) = ${this.learner.observation_table[close_rep]}\\}\\)
        I'm going to move ${close_rep} from SA to S`}consistent_message(s1,s2,new_col){return`The table is not consistent : 
        \\(\\{row(${s1?s1:"\u03B5"}) = row(${s2?s2:"\u03B5"}) \\land (${s1?s1:"\u03B5"}, ${s2?s2:"\u03B5"}) \\in S\\}\\)
        but \\(\\{row(${s1+new_col[0]}) \\neq row(${s2+new_col[0]}) \\land (${s1?s1:"\u03B5"}, ${s2?s2:"\u03B5"}) \\in S \\land ${new_col[0]} \\in \\Sigma\\}\\)
        I'm going to add the column "${new_col}" since \\(T(${s1+new_col}) \\neq T(${s2+new_col})\\)`}table_to_update_after_equiv(answer){this.learner.add_elt_in_S(answer,true)}}
//# sourceMappingURL=HTML_L_star.js.map
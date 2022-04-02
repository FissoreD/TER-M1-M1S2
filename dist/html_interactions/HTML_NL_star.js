import{NL_star}from"../lerners/NL_star.js";import{HTML_LernerBase}from"./HTML_LernerBase.js";export class HTML_NL_star extends HTML_LernerBase{constructor(teacher){super(new NL_star(teacher))}add_row_html(parent,fst,head,row_elts,colspan=1,rowspan=1){let row=super.add_row_html(parent,fst,head,row_elts,colspan,rowspan);if(head!=undefined&&this.lerner.prime_lines.includes(head)){row.className+="prime-row"}return row}close_message(close_rep){return`
    The table is not closed since
    \\(\\{row(${close_rep}) = ${this.lerner.observation_table[close_rep]} \\land ${close_rep} \\in SA\\}\\) but \\(\\{\\nexists s \\in S | row(s) \\sqsupseteq ${this.lerner.observation_table[close_rep]}\\}\\)
    I'm going to move "${close_rep}" from SA to S`}consistent_message(s1,s2,new_col){return`
    The table is not consistent :
    take \\(${s1?s1:"\u03B5"}\\in S \\land ${s2?s2:"\u03B5"} \\in S \\land ${new_col[0]} \\in \\Sigma \\)
    \\(\\{row(${s1?s1:"\u03B5"}) \\sqsubseteq row(${s2?s2:"\u03B5"})\\}\\)
    but \\(\\{row(${s1?s1:"\u03B5"} \\circ ${new_col[0]}) \\not\\sqsubseteq row(${s2?s2:"\u03B5"} \\circ ${new_col[0]})\\}\\)
    I'm going to add the column \\(${new_col} \\in \\Sigma \\circ E\\) since \\(T(${s1?s1:"\u03B5"} \\circ ${new_col}) > T(${s2?s2:"\u03B5"} \\circ ${new_col})\\)`}table_to_update_after_equiv(answer){this.lerner.add_elt_in_E(answer)}}
//# sourceMappingURL=HTML_NL_star.js.map
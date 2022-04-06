define(["require", "exports", "../lerners/L_star.js", "./HTML_LernerBase.js"], function (require, exports, L_star_js_1, HTML_LernerBase_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTML_L_star = void 0;
    class HTML_L_star extends HTML_LernerBase_js_1.HTML_LernerBase {
        constructor(teacher) {
            super(new L_star_js_1.L_star(teacher));
        }
        close_message(close_rep) {
            return `The table is not closed since
        \\(\\{row(${close_rep}) = ${this.lerner.observation_table[close_rep]} \\land 0 \\in SA\\}\\) but \\(\\{\\nexists s \\in S | row(s) = ${this.lerner.observation_table[close_rep]}\\}\\)
        I'm going to move ${close_rep} from SA to S`;
        }
        consistent_message(s1, s2, new_col) {
            return `The table is not consistent : 
        \\(\\{row(${s1 ? s1 : "ε"}) = row(${s2 ? s2 : "ε"}) \\land (${s1 ? s1 : "ε"}, ${s2 ? s2 : "ε"}) \\in S\\}\\)
        but \\(\\{row(${s1 + new_col[0]}) \\neq row(${s2 + new_col[0]}) \\land (${s1 ? s1 : "ε"}, ${s2 ? s2 : "ε"}) \\in S \\land ${new_col[0]} \\in \\Sigma\\}\\)
        I'm going to add the column "${new_col}" since \\(T(${s1 + new_col}) \\neq T(${s2 + new_col})\\)`;
        }
        table_to_update_after_equiv(answer) {
            this.lerner.add_elt_in_S(answer, true);
        }
    }
    exports.HTML_L_star = HTML_L_star;
});
//# sourceMappingURL=HTML_L_star.js.map
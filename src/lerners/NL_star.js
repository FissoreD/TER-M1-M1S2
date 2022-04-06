define(["require", "exports", "../automaton/Automaton.js", "../tools/Utilities.js", "./LernerBase.js"], function (require, exports, Automaton_js_1, Utilities_js_1, LernerBase_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NL_star = void 0;
    class NL_star extends LernerBase_js_1.LernerBase {
        constructor(teacher) {
            super(teacher);
            this.prime_lines = Array.from(this.alphabet).concat("");
        }
        is_prime(row_key) {
            if (this.prime_lines == undefined)
                this.prime_lines = [];
            let row_value = this.observation_table[row_key];
            if (row_value.length < 2 || parseInt(row_value) == 0)
                return true;
            let res = "";
            for (let i = 0; i < row_value.length; i++)
                res += "0";
            Object.values(this.observation_table).forEach(value => {
                if (value != row_value && this.is_covered(value, row_value)) {
                    res = this.row_union(res, value);
                }
            });
            return res != row_value;
        }
        row_union(row1, row2) {
            return Array.from(row1).map((e, pos) => [e, row2.charAt(pos)].includes("1") ? "1" : "0").join("");
        }
        is_covered(row1, row2) {
            return Array.from(row1).every((e, pos) => e <= row2.charAt(pos));
        }
        check_prime_lines() {
            this.prime_lines = [...this.S, ...this.SA].filter(l => this.is_prime(l));
        }
        add_elt_in_S(new_elt) {
            let added_list = super.add_elt_in_S(new_elt);
            added_list.forEach(e => {
                if (!this.prime_lines?.includes(e) && this.is_prime(e)) {
                    this.prime_lines.push(e);
                    this.check_prime_lines();
                }
            });
            return added_list;
        }
        add_elt_in_E(new_elt) {
            let suffix_list = (0, Utilities_js_1.generate_suffix_list)(new_elt);
            for (const suffix of suffix_list) {
                if (this.E.includes(suffix))
                    break;
                this.SA.forEach(s => this.make_member(s, suffix));
                this.S.forEach(s => this.make_member(s, suffix));
                this.E.push(suffix);
            }
            this.check_prime_lines();
        }
        is_close() {
            return this.SA.find(t => !this.S.some(s => this.same_row(s, t)) && this.prime_lines.includes(t));
        }
        is_consistent() {
            for (let s1_ind = 0; s1_ind < this.S.length; s1_ind++) {
                for (let s2_ind = s1_ind + 1; s2_ind < this.S.length; s2_ind++) {
                    let s1 = this.S[s1_ind];
                    let s2 = this.S[s2_ind];
                    let value_s1 = this.observation_table[s1];
                    let value_s2 = this.observation_table[s2];
                    if (this.is_covered(value_s1, value_s2)) {
                        for (const a of this.alphabet) {
                            let value_s1_p = this.observation_table[s1 + a];
                            let value_s2_p = this.observation_table[s2 + a];
                            if (!this.is_covered(value_s1_p, value_s2_p)) {
                                for (let i = 0; i < this.E.length; i++) {
                                    if (this.observation_table[s1 + a][i] <
                                        this.observation_table[s2 + a][i] && !this.E.includes(a + this.E[i])) {
                                        return [s1, s2, a + this.E[i]];
                                    }
                                }
                            }
                        }
                    }
                    else if (this.is_covered(value_s2, value_s1)) {
                        for (const a of this.alphabet) {
                            let value_s1_p = this.observation_table[s1 + a];
                            let value_s2_p = this.observation_table[s2 + a];
                            if (!this.is_covered(value_s2_p, value_s1_p))
                                for (let i = 0; i < this.E.length; i++) {
                                    if (this.observation_table[s1 + a][i] <
                                        this.observation_table[s2 + a][i] && !this.E.includes(a + this.E[i])) {
                                        return [s2, s1, a + this.E[i]];
                                    }
                                }
                        }
                    }
                }
            }
        }
        make_automaton() {
            let states = {};
            this.S.filter(e => this.prime_lines.includes(e)).forEach(e => states[this.observation_table[e]] = e);
            let first_state = this.S.filter(e => {
                let row_e = this.observation_table[e];
                return this.prime_lines.includes(e) && this.is_covered(row_e, this.observation_table[""]);
            }).map(e => this.observation_table[e]);
            let keys = Object.keys(states);
            let end_states = keys.filter(k => k[0] == '1');
            let transitions = [];
            for (const state of this.S) {
                if (!this.prime_lines.includes(state))
                    continue;
                for (const symbol of this.alphabet) {
                    transitions.push({
                        fromState: this.observation_table[state],
                        symbol: symbol,
                        toStates: keys.filter(v => this.is_covered(v, this.observation_table[state + symbol]))
                    });
                }
            }
            this.automaton = new Automaton_js_1.Automaton({
                "alphabet": this.alphabet,
                "acceptingStates": end_states,
                "startState": first_state,
                "states": keys,
                "transitions": transitions
            });
            return this.automaton;
        }
        table_to_update_after_equiv(answer) {
            this.add_elt_in_E(answer);
        }
    }
    exports.NL_star = NL_star;
});
//# sourceMappingURL=NL_star.js.map
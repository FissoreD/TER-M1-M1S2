var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
define("Automaton", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Automaton = void 0;
    class Automaton {
        constructor(json) {
            this.transitions = json.transitions;
            this.startNode = json.startNode;
            this.endNodes = json.endNodes;
            this.currentNode = this.startNode;
            this.alphabet = Array.from(json.alphabet);
            this.nodes = json.states;
        }
        next_step(next_char) {
            let x = this.nodes.indexOf(this.currentNode);
            let y = this.alphabet.indexOf(next_char);
            this.currentNode = this.transitions[x][y];
        }
        draw_next_step(next_char) {
            this.color_node(false);
            this.next_step(next_char);
            this.color_node(true);
        }
        initiate_graph() {
            let div_with_automaton = document.getElementById("automaton");
            div_with_automaton.removeAttribute('data-processed');
            div_with_automaton.innerHTML = this.matrix_to_mermaid();
            mermaid.init(document.querySelectorAll(".mermaid"));
            this.color_node(true);
            this.endNodes.forEach(n => {
                let circle = this.get_current_graph_node(n);
                let smaller_circle = circle.cloneNode();
                (smaller_circle).attributes['r'].value -= 3;
                circle.parentNode.insertBefore(smaller_circle, circle.nextSibling);
            });
        }
        get_current_graph_node(node) {
            let elts = document.querySelectorAll('.node').values();
            let currentNode = elts.next();
            while (elts) {
                if (currentNode.value.getElementsByClassName('nodeLabel')[0].innerHTML == node)
                    break;
                currentNode = elts.next();
            }
            return currentNode.value.firstChild;
        }
        matrix_to_mermaid() {
            let res = "flowchart LR";
            res = res.concat("\n" + this.create_entering_arrow());
            for (let i = 0; i < this.nodes.length; i++) {
                for (let j = 0; j < this.alphabet.length; j++) {
                    res = res.concat("\n");
                    res = res.concat(this.create_triple(this.nodes[i], this.alphabet[j], this.transitions[i][j]));
                }
            }
            res = res.concat("\nstyle START fill:#FFFFFF, stroke:#FFFFFF;");
            console.log(res);
            return res;
        }
        color_node(toFill) {
            let current_circle = this.get_current_graph_node(this.currentNode);
            let next_circle = current_circle.nextSibling;
            if (toFill) {
                if (this.endNodes.includes(this.currentNode))
                    next_circle.style.fill = 'red';
                else
                    current_circle.style.fill = 'red';
            }
            else {
                if (this.endNodes.includes(this.currentNode))
                    next_circle.removeAttribute('style');
                else
                    current_circle.removeAttribute('style');
            }
        }
        create_triple(A, transition, B) {
            return `${A}((${A})) -->| ${transition} | ${B}((${B}))`;
        }
        create_entering_arrow() {
            return `START[ ]--> ${this.startNode}`;
        }
    }
    exports.Automaton = Automaton;
});
define("Utilities", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.listener_automaton_click_button = exports.count_str_occurrences = exports.generate_suffix_list = exports.generate_prefix_list = exports.same_vector = void 0;
    function same_vector(v1, v2) {
        return v1.map((elt, pos) => elt == v2[pos]).every(e => e);
    }
    exports.same_vector = same_vector;
    const generate_prefix_list = (str) => Array(str.length + 1).fill(0).map((_, i) => str.substring(0, i)).reverse();
    exports.generate_prefix_list = generate_prefix_list;
    const generate_suffix_list = (str) => Array(str.length + 1).fill("").map((_, i) => str.substring(i, str.length + 1));
    exports.generate_suffix_list = generate_suffix_list;
    const count_str_occurrences = (str, obj) => Array.from(str).filter(f => f == obj).length;
    exports.count_str_occurrences = count_str_occurrences;
    function listener_automaton_click_button(a) {
        let next_char = () => {
            let dom = document.getElementById('input');
            let name = dom.innerText;
            let currentNode = name[0];
            name = name.substring(1);
            a.draw_next_step(currentNode);
            dom.innerText = name;
        };
        let x = document.getElementById("next_char");
        x.addEventListener("click", next_char);
    }
    exports.listener_automaton_click_button = listener_automaton_click_button;
});
define("Teacher", ["require", "exports", "Utilities"], function (require, exports, Utilities_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Teacher = void 0;
    class Teacher {
        query(sentence) {
            let nb_of_zero = (0, Utilities_js_1.count_str_occurrences)(sentence, "0");
            return this.boolToString(sentence.length % 2 == 0 && nb_of_zero % 2 == 0);
        }
        member(automaton) {
            let l = ["11", "011", undefined];
            return l[Teacher.i++];
        }
        boolToString(bool) {
            return bool ? "1" : "0";
        }
    }
    exports.Teacher = Teacher;
    Teacher.i = 0;
});
define("L_star/L_star", ["require", "exports", "Automaton", "Utilities"], function (require, exports, Automaton_js_1, Utilities_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.L_star = void 0;
    class L_star {
        constructor(alphabet, teacher) {
            this.alphabet = Array.from(alphabet);
            this.teacher = teacher;
            this.E = [""];
            this.S = [""];
            this.SA = Array.from(alphabet);
            this.observation_table = {};
            this.make_query("", "");
            this.SA.forEach(elt => this.make_query(elt, ""));
        }
        update_observation_table(new_str, value) {
            let old_value = this.observation_table[new_str];
            if (old_value != undefined)
                value = old_value + value;
            this.observation_table[new_str] = value;
        }
        make_query(pref, suff) {
            var answer = this.teacher.query(pref + suff);
            this.update_observation_table(pref, answer);
        }
        make_member(a) {
            let answer = this.teacher.member(a);
            if (answer != undefined) {
                this.add_elt_in_S(answer);
            }
        }
        add_elt_in_S(new_elt) {
            let prefix_list = (0, Utilities_js_2.generate_prefix_list)(new_elt);
            for (const prefix of prefix_list) {
                if (this.S.includes(prefix))
                    return;
                if (this.SA.includes(prefix)) {
                    console.log("moving ", prefix, "from", this.SA, "to", this.S);
                    this.move_from_SA_to_S(prefix);
                    console.log(this.SA, this.S);
                    this.alphabet.forEach(a => {
                        const new_word = prefix + a;
                        if (!this.SA.includes(new_word) && !this.S.includes(new_word)) {
                            this.E.forEach(e => this.make_query(new_word, e));
                            this.SA.push(new_word);
                        }
                    });
                    console.log("And not sa is", this.SA);
                }
                else {
                    console.log("In third branch analyzing", prefix);
                    console.log("Atm S is", this.S, "SA", this.SA, this.SA.includes(prefix));
                    this.E.forEach(e => this.make_query(prefix, e));
                    this.S.push(prefix);
                    this.alphabet.forEach(a => {
                        this.SA.push(prefix + a);
                        this.E.forEach(e => this.make_query(prefix + a, e));
                    });
                }
            }
        }
        move_from_SA_to_S(elt) {
            const index = this.SA.indexOf(elt);
            if (index != -1)
                this.SA.splice(index, 1);
            this.S.push(elt);
        }
        add_column(col_name) {
            console.log("Before \n", this.observation_table);
            console.log("SA", this.SA, "S", this.S, "alphabet", this.E);
            this.SA.forEach(t => this.make_query(t, col_name));
            this.S.forEach(s => {
                console.log("This is s", s);
                this.make_query(s, col_name);
            });
            console.log("After\n", this.observation_table);
            this.E.push(col_name);
        }
        define_next_questions() {
            const close_rep = this.is_close();
            const consistence_rep = this.is_consistent();
            if (close_rep != undefined) {
                this.add_elt_in_S(close_rep);
            }
            else if (consistence_rep != undefined) {
                this.add_column(consistence_rep);
            }
            else {
                return true;
            }
            return false;
        }
        make_automaton() {
            let states = {};
            this.S.forEach(e => states[this.observation_table[e]] = e);
            let first_state = this.observation_table[""];
            let end_states = [];
            let keys = Object.keys(states);
            let ar = keys.map((k) => this.alphabet.map(a => {
                return this.observation_table[states[k] + a];
            }));
            return new Automaton_js_1.Automaton({
                "alphabet": this.alphabet,
                "endNodes": end_states,
                "startNode": first_state,
                "states": keys,
                "transitions": ar
            });
        }
        is_close() {
            return this.SA.find(t => !this.S.some(s => this.same_row(s, t)));
        }
        is_consistent() {
            for (let s1_ind = 0; s1_ind < this.S.length; s1_ind++) {
                for (let s2_ind = s1_ind + 1; s2_ind < this.S.length; s2_ind++) {
                    let s1 = this.S[s1_ind];
                    let s2 = this.S[s2_ind];
                    console.log(s1, s2);
                    if (this.same_row(s1, s2)) {
                        let first_unmacth = this.alphabet.find(a => {
                            console.log(s1 + a, s2 + a, !this.same_row(s1 + a, s2 + a));
                            return !this.same_row(s1 + a, s2 + a);
                        });
                        if (first_unmacth != undefined) {
                            console.log("The first unmatch is caused by", first_unmacth, "between", s1, "and", s2);
                            return first_unmacth;
                        }
                        ;
                    }
                }
            }
        }
        same_row(a, b) {
            return this.observation_table[a] == this.observation_table[b];
        }
    }
    exports.L_star = L_star;
});
define("Teacher_models/even0_1", [], {
    "even_zero_one": {
        "transitions": [
            ["q1", "q0"],
            ["q1", "q0"],
            ["q0", "q0"]
        ],
        "startNode": "q0",
        "endNodes": ["q1"],
        "alphabet": ["10"],
        "states": ["q0", "q1", "q3"]
    }
});
define("Main", ["require", "exports", "Automaton", "L_star/L_star", "Teacher", "Teacher_models/even0_1"], function (require, exports, Automaton_js_2, L_star_js_1, Teacher_js_1, data) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    data = __importStar(data);
    const L = new L_star_js_1.L_star('01', new Teacher_js_1.Teacher());
    L.define_next_questions();
    let a = new Automaton_js_2.Automaton(data.even_zero_one);
    a.initiate_graph();
});
define("MyString", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MyString = void 0;
    class MyString extends String {
        constructor(entry) {
            super(entry);
            this.prefix_list = MyString.generate_prefix_list(this.toString());
            this.suffix_list = MyString.generate_suffix_list(this.toString());
        }
        is_prefix(str) {
            return str.substring(0, str.length) == this.toString();
        }
        is_suffix(str) {
            return str.substring(this.length - str.length) == this.toString();
        }
    }
    exports.MyString = MyString;
    MyString.generate_prefix_list = (str) => Array(str.length + 1).fill(0).map((_, i) => str.substring(0, i));
    MyString.generate_suffix_list = (str) => Array(str.length + 1).fill("").map((_, i) => str.substring(i, str.length + 1));
});
define("L_star/Observation_table", ["require", "exports", "Utilities"], function (require, exports, Utilities_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Observation_table = void 0;
    class Observation_table {
        constructor() {
            this.columns = {};
            this.rows = {};
            this.matrix = [[]];
        }
        add_column(column_name) {
            this.columns[column_name] = Object.keys(this.columns).length;
        }
        add_row(row_name) {
            this.rows[row_name] = Object.keys(this.rows).length;
        }
        set_value(row_name, column_name, bool) {
            this.matrix[this.rows[row_name]][this.columns[column_name]] = bool;
        }
        get_value(row_name, column_name) {
            return this.matrix[this.rows[row_name]][this.columns[column_name]];
        }
        get_row(row_name) {
            return this.matrix[this.rows[row_name]];
        }
        same_row(row1, row2) {
            const r1 = this.get_row(row1);
            const r2 = this.get_row(row2);
            return r1 != undefined && r2 != undefined &&
                (0, Utilities_1.same_vector)(r1, r2);
        }
    }
    exports.Observation_table = Observation_table;
});
define("test/L_star_test", ["require", "exports", "L_star/L_star", "Teacher", "Utilities"], function (require, exports, L_star_js_2, Teacher_js_2, Utilities_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let graphic = true;
    let lerner = new L_star_js_2.L_star("01", new Teacher_js_2.Teacher());
    console.log(lerner);
    for (let i = 0; i < 6; i++) {
        console.log(`/ ************* STEP ${i + 1} ************* /`);
        if (lerner.define_next_questions()) {
            console.log("Making automaton :");
            let automaton = lerner.make_automaton();
            if (graphic) {
                console.log(automaton.initiate_graph());
                (0, Utilities_js_3.listener_automaton_click_button)(automaton);
            }
            console.log(automaton);
            lerner.make_member(automaton);
            console.log("After member function : \n", lerner);
        }
        else {
            console.log(lerner);
        }
    }
});
//# sourceMappingURL=out.js.map
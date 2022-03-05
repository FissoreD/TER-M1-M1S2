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
        restart() {
            this.currentNode = this.startNode;
        }
        draw_next_step(next_char) {
            this.color_node(false);
            this.next_step(next_char);
            this.color_node(true);
        }
        initiate_graph() {
            let automatonHTML = document.getElementById("automaton-mermaid");
            automatonHTML.removeAttribute('data-processed');
            automatonHTML.innerHTML = this.matrix_to_mermaid();
            mermaid.init(document.querySelectorAll(".mermaid"));
            this.endNodes.forEach(n => {
                let circle = this.get_current_graph_node(n);
                let smaller_circle = circle.cloneNode();
                (smaller_circle).attributes['r'].value -= 3;
                circle.parentNode.insertBefore(smaller_circle, circle.nextSibling);
            });
            this.color_node(true);
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
                    next_circle.style.fill = '#009879';
                else
                    current_circle.style.fill = '#009879';
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
    exports.count_str_occurrences = exports.generate_suffix_list = exports.generate_prefix_list = exports.same_vector = void 0;
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
});
define("Teacher", ["require", "exports", "Utilities"], function (require, exports, Utilities_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.teacherEvenAandThreeB = exports.teacherA3fromLast = exports.teacherPairZeroAndOne = exports.Teacher = void 0;
    class Teacher {
        constructor(description, f, counter_exemples) {
            this.check_function = f;
            this.counter_exemples = counter_exemples;
            this.counter = 0;
            this.description = description;
        }
        query(sentence) {
            return this.boolToString(this.check_function(sentence));
        }
        member(automaton) {
            return this.counter_exemples[this.counter++];
        }
        boolToString(bool) {
            return bool ? "1" : "0";
        }
    }
    exports.Teacher = Teacher;
    exports.teacherPairZeroAndOne = new Teacher(`Automata accepting L = {w in (0, 1)* | #(w_0) % 2 = 0 and #(w_1) % 2 = 0} 
    → w has even nb of "0" and even nb of "1"`, sentence => {
        let parity = (0, Utilities_js_1.count_str_occurrences)(sentence, "0");
        return parity % 2 == 0 && sentence.length % 2 == 0;
    }, ["11", "011"]);
    exports.teacherA3fromLast = new Teacher(`Automata accepting L = {w in (a, b)* | w[-3] = a} 
    → w has an 'a' in the 3rd pos from end`, sentence => sentence.length >= 3 && sentence[sentence.length - 3] == 'a', ["aaa"]);
    exports.teacherEvenAandThreeB = new Teacher(`Automata accepting L = {w in (a, b)* | #(w_b) > 2 and #(w_a) % 2 = 0}
    → w has at least 3 'b' and an even nb of 'a'`, sentence => (0, Utilities_js_1.count_str_occurrences)(sentence, "b") >= 3 && (0, Utilities_js_1.count_str_occurrences)(sentence, "a") % 2 == 0, ["bbb", "ababb", "bbaab", "babba"]);
});
define("L_star/L_star", ["require", "exports", "Automaton", "Utilities"], function (require, exports, Automaton_js_1, Utilities_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.L_star = void 0;
    class L_star {
        constructor(alphabet, teacher) {
            this.alphabet = Array.from(alphabet);
            this.teacher = teacher;
            this.query_number = 0;
            this.member_number = 0;
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
            this.query_number++;
        }
        make_member(a) {
            let answer = this.teacher.member(a);
            this.member_number++;
            return answer;
        }
        add_elt_in_S(new_elt) {
            let prefix_list = (0, Utilities_js_2.generate_prefix_list)(new_elt);
            console.log(new_elt, "is going to be added in S, it has", prefix_list);
            for (const prefix of prefix_list) {
                if (this.S.includes(prefix))
                    return;
                if (this.SA.includes(prefix)) {
                    this.move_from_SA_to_S(prefix);
                    this.alphabet.forEach(a => {
                        const new_word = prefix + a;
                        if (!this.SA.includes(new_word) && !this.S.includes(new_word)) {
                            this.E.forEach(e => this.make_query(new_word, e));
                            this.SA.push(new_word);
                        }
                    });
                }
                else {
                    this.E.forEach(e => this.make_query(prefix, e));
                    this.S.push(prefix);
                    this.alphabet.forEach(a => {
                        let new_word = prefix + a;
                        if (!this.SA.includes(new_word) && !this.S.includes(new_word)) {
                            this.SA.push(prefix + a);
                            this.E.forEach(e => this.make_query(prefix + a, e));
                        }
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
        find_suffix_not_compatible(consistence_error) {
            let e = this.E.find((_e, pos) => {
                let cell = (value) => this.observation_table[consistence_error[value] + consistence_error[2]][pos];
                return cell(0) != cell(1);
            });
            let new_col = consistence_error[2] + e;
            return new_col;
        }
        add_column(new_col) {
            let L = [this.SA, this.S];
            L.forEach(l => l.forEach(s => this.make_query(s, new_col)));
            this.E.push(new_col);
        }
        define_next_questions() {
            const close_rep = this.is_close();
            const consistence_rep = this.is_consistent();
            if (close_rep != undefined) {
                this.add_elt_in_S(close_rep);
            }
            else if (consistence_rep != undefined) {
                let new_col = this.find_suffix_not_compatible(consistence_rep);
                this.add_column(new_col);
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
            let keys = Object.keys(states);
            let end_states = keys.filter(k => k[0] == '1');
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
                    if (this.same_row(s1, s2)) {
                        let first_unmacth = this.alphabet.find(a => !this.same_row(s1 + a, s2 + a));
                        if (first_unmacth != undefined)
                            return [s1, s2, first_unmacth];
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
define("L_star/HTML_L_star", ["require", "exports", "Main", "L_star/L_star"], function (require, exports, Main_js_1, L_star_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTML_LStar = void 0;
    class HTML_LStar extends L_star_js_1.L_star {
        constructor(alphabet, teacher) {
            super(alphabet, teacher);
            this.finish = false;
            this.table_header = Main_js_1.tableHTML.createTHead();
            this.table_body = Main_js_1.tableHTML.createTBody();
            this.pile_actions = [() => this.draw_table()];
        }
        draw_table() {
            this.add_row(this.table_header, "Table", undefined, this.E, 2);
            var fst = "S";
            for (var s of this.S) {
                const row = Array.from(this.observation_table[s]);
                this.add_row(this.table_body, fst, s, row, 1, fst ? this.S.length : 1);
                fst = undefined;
            }
            var fst = "SA";
            for (var s of this.SA) {
                const row = Array.from(this.observation_table[s]);
                this.add_row(this.table_body, fst, s, row, 1, fst ? this.SA.length : 1);
                fst = undefined;
            }
        }
        add_row(parent, fst, head, row_elts, colspan = 1, rowspan = 1) {
            let convert_to_epsilon = (e) => e == "" ? "&epsilon;" : e;
            let create_cell_with_text = (row, txt) => {
                var cell = row.insertCell();
                cell.innerHTML = `${convert_to_epsilon(txt)}`;
            };
            var row = parent.insertRow();
            if (fst) {
                row.style.borderTop = "2px solid #009879";
                var cell = document.createElement('th');
                cell.setAttribute("rowspan", rowspan + "");
                cell.setAttribute("colspan", colspan + "");
                cell.innerHTML = convert_to_epsilon(fst);
                row.appendChild(cell);
            }
            if (head != undefined)
                create_cell_with_text(row, head);
            for (var letter of row_elts)
                create_cell_with_text(row, letter);
        }
        clear_table() {
            this.table_body.innerHTML = "";
            this.table_header.innerHTML = "";
        }
        graphic_next_step() {
            if (this.finish) {
                if (Main_js_1.message.innerHTML != "")
                    Main_js_1.message.innerHTML = "The Teacher has accepted the automaton";
            }
            else if (this.pile_actions.length > 0) {
                this.pile_actions.shift()();
            }
            else if (!this.close_action()) { }
            else if (!this.consistence_action()) { }
            else
                this.send_automaton_action();
            Main_js_1.message.innerHTML =
                `Queries = ${this.query_number} - Membership = ${this.member_number} <br>
      ${Main_js_1.message.innerHTML}`;
        }
        add_automaton_listener() {
            let input = document.createElement("input");
            let setB = document.createElement("button");
            setB.innerHTML = "Reinitialize automaton";
            setB.addEventListener('click', () => {
                this.automaton.restart();
                this.automaton.initiate_graph();
            });
            let sendB = document.createElement("button");
            sendB.innerHTML = "Next char";
            sendB.addEventListener('click', () => {
                this.automaton.draw_next_step(input.value[0]);
                input.value = input.value.slice(1);
            });
            Main_js_1.automatonDiv.appendChild(input);
            Main_js_1.automatonDiv.appendChild(sendB);
            Main_js_1.automatonDiv.appendChild(setB);
        }
        close_action() {
            const close_rep = this.is_close();
            if (close_rep != undefined) {
                Main_js_1.message.innerText =
                    `The table is not closed since
        row(${close_rep}) = ${this.observation_table[close_rep]} but there is no s in S such that row(s) = ${this.observation_table[close_rep]};
        I'm going to move ${close_rep} from SA to S`;
                this.pile_actions.push(() => {
                    Main_js_1.message.innerText = "";
                    this.add_elt_in_S(close_rep);
                    this.clear_table();
                    this.draw_table();
                });
                return false;
            }
            return true;
        }
        consistence_action() {
            const consistence_rep = this.is_consistent();
            if (consistence_rep != undefined) {
                let new_col = this.find_suffix_not_compatible(consistence_rep);
                let s1 = consistence_rep[0];
                let s2 = consistence_rep[1];
                let a = consistence_rep[2];
                Main_js_1.message.innerText =
                    `The table is not consistent : 
        row(${s1 ? s1 : "ε"}) and row(${s2 ? s2 : "ε"}) have same value in S,
        but their value is not the same if we add ${a} 
        row(${s1 + a}) != row(${s2 + a})
        I'm going to add the column ${new_col} since T(${s1 + new_col}) != T(${s2 + new_col})`;
                this.pile_actions.push(() => {
                    Main_js_1.message.innerText = "";
                    this.add_column(new_col);
                    this.clear_table();
                    this.draw_table();
                });
                return false;
            }
            return true;
        }
        send_automaton_action() {
            Main_js_1.message.innerText =
                `The table is consistent and closed, I will send an automaton`;
            let automaton = this.make_automaton();
            this.automaton = automaton;
            this.pile_actions.push(() => {
                Main_js_1.message.innerHTML = "";
                automaton.initiate_graph();
                this.add_automaton_listener();
                let answer = this.make_member(automaton);
                if (answer != undefined) {
                    Main_js_1.message.innerText =
                        `The sent automaton is not valid, 
          here is a counter-exemple ${answer}`;
                    this.pile_actions.push(() => {
                        Main_js_1.message.innerHTML = "";
                        (0, Main_js_1.clear_automaton_HTML)();
                        console.log("Adding", answer, "in S");
                        this.add_elt_in_S(answer);
                        this.clear_table();
                        this.draw_table();
                    });
                    return;
                }
                this.finish = true;
            });
        }
    }
    exports.HTML_LStar = HTML_LStar;
});
define("models/teacher_models", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.even_zero_one = void 0;
    exports.even_zero_one = {
        "transitions": [
            ["q1", "q0"],
            ["q1", "q0"],
            ["q0", "q0"]
        ],
        "startNode": "q0",
        "endNodes": ["q1"],
        "alphabet": "10",
        "states": ["q0", "q1", "q3"]
    };
});
define("monoid/Monoid", ["require", "exports", "Automaton", "models/teacher_models"], function (require, exports, Automaton_js_2, teacher_models_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mainMonoid = exports.Monoid = void 0;
    class Monoid {
        constructor(automaton) {
            this.automaton = automaton;
            this.state_passage = [];
            this.letter_passage = [];
            this.matrix_passage = [];
            this.automaton.alphabet.forEach(l => {
                this.letter_passage.push(l);
                this.state_passage.push(automaton.startNode);
            });
        }
        calculate_monoids() {
            let l = this.automaton.alphabet;
            console.log("here");
            while (l.length > 0) {
                let current_word = l.pop();
                console.log(current_word);
                this.letter_passage.push(current_word);
                this.state_passage.push(this.automaton.currentNode);
            }
            console.log(this.letter_passage);
            console.log(this.state_passage);
        }
    }
    exports.Monoid = Monoid;
    function mainMonoid() {
        let aut = new Automaton_js_2.Automaton(teacher_models_js_1.even_zero_one);
        let mon = new Monoid(aut);
        mon.calculate_monoids();
    }
    exports.mainMonoid = mainMonoid;
    mainMonoid();
});
define("Main", ["require", "exports", "Teacher", "L_star/HTML_L_star"], function (require, exports, Teacher_js_1, HTML_L_star_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.clear_automaton_HTML = exports.initiate_global_vars = exports.automatonHTML = exports.tableHTML = exports.message = exports.current_automaton = exports.automatonDiv = void 0;
    function initiate_global_vars() {
        exports.automatonHTML = document.getElementById("automaton-mermaid");
        exports.automatonDiv = document.getElementById("input-automaton");
        let button_next = document.getElementById("next_step");
        exports.message = document.getElementById("message");
        exports.tableHTML = document.getElementById("table");
        let teacher_switch_HTML = document.getElementById("teacher_switch");
        let teacher_description_HTML = document.getElementById("teacher_description");
        let automata = [
            () => new HTML_L_star_js_1.HTML_LStar("01", Teacher_js_1.teacherPairZeroAndOne),
            () => new HTML_L_star_js_1.HTML_LStar("ab", Teacher_js_1.teacherA3fromLast),
            () => new HTML_L_star_js_1.HTML_LStar("ab", Teacher_js_1.teacherEvenAandThreeB)
        ];
        automata.forEach((a, pos) => {
            let radio = document.createElement("input");
            let label = document.createElement("label");
            let span = document.createElement("span");
            radio.type = 'radio';
            radio.name = 'teacher_switcher';
            span.innerHTML = pos + "";
            radio.addEventListener("click", () => {
                exports.tableHTML.innerHTML = "";
                exports.message.innerHTML = "";
                clear_automaton_HTML();
                exports.current_automaton = a();
                teacher_description_HTML.innerHTML = exports.current_automaton.teacher.description;
            });
            label.appendChild(radio);
            label.append(span);
            teacher_switch_HTML.appendChild(label);
            if (pos == 0) {
                radio.click();
            }
        });
        button_next.addEventListener("click", () => exports.current_automaton.graphic_next_step());
    }
    exports.initiate_global_vars = initiate_global_vars;
    function clear_automaton_HTML() {
        exports.automatonDiv.innerHTML = "";
        exports.automatonHTML.innerHTML = "";
    }
    exports.clear_automaton_HTML = clear_automaton_HTML;
    try {
        process == undefined;
        console.log("HERE");
    }
    catch (e) {
        window.onload = initiate_global_vars();
    }
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
define("html_interactions/listeners", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.set_text = exports.listener_automaton_click_button = void 0;
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
    function set_text() {
        let form = document.getElementById("form1");
        let str = form.getAttribute("id");
        document.getElementById("input").innerText = str;
    }
    exports.set_text = set_text;
});
define("test_nodejs/L_star_test", ["require", "exports", "html_interactions/listeners", "L_star/L_star", "Teacher"], function (require, exports, listeners_js_1, L_star_js_2, Teacher_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let graphic = false;
    let lerner = new L_star_js_2.L_star("01", Teacher_js_2.teacherPairZeroAndOne);
    console.log(lerner);
    for (let i = 0; i < 6; i++) {
        console.log(`/ ************* STEP ${i + 1} ************* /`);
        if (lerner.define_next_questions()) {
            console.log("Making automaton :");
            let automaton = lerner.make_automaton();
            if (graphic) {
                console.log(automaton.initiate_graph());
                (0, listeners_js_1.listener_automaton_click_button)(automaton);
            }
            console.log(automaton);
            let answer = lerner.make_member(automaton);
            if (answer != undefined) {
                lerner.add_elt_in_S(answer);
            }
            console.log("After member function : \n", lerner);
        }
        else {
            console.log(lerner);
        }
    }
});
//# sourceMappingURL=out.js.map
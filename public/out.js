"use strict";
define("Automaton", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Automaton = void 0;
    ;
    class Automaton {
        constructor(json) {
            this.transitions = json.transitions;
            this.startState = json.startState;
            this.endState = json.endState;
            this.currentState = this.startState;
            this.alphabet = Array.from(json.alphabet);
            this.states = json.states;
        }
        next_step(next_char) {
            let x = this.states.indexOf(this.currentState);
            let y = this.alphabet.indexOf(next_char);
            this.currentState = this.transitions[x][y][0];
        }
        accept_word(word) {
            this.restart();
            Array.from(word).forEach(letter => this.next_step(letter));
            let is_accepted = this.endState.includes(this.currentState);
            this.restart();
            return is_accepted;
        }
        accept_word_nfa(word) {
            let recursive_explore = (word, index, current_state) => {
                if (index < word.length) {
                    let x = this.states.indexOf(current_state);
                    let y = this.alphabet.indexOf(word[index]);
                    let next_states = this.transitions[x][y];
                    return next_states.some(next_state => recursive_explore(word, index + 1, next_state));
                }
                else {
                    return this.endState.includes(current_state);
                }
            };
            return recursive_explore(word, 0, this.startState);
        }
        restart() {
            this.currentState = this.startState;
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
            this.endState.forEach(n => {
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
            res = res.concat("\n" + this.create_entering_arrow() + "\n");
            let triples = {};
            for (let i = 0; i < this.states.length; i++) {
                for (let j = 0; j < this.alphabet.length; j++) {
                    for (const state of this.transitions[i][j]) {
                        let stateA_concat_stateB = this.states[i] + '&' + state;
                        if (triples[stateA_concat_stateB]) {
                            triples[stateA_concat_stateB].push(this.alphabet[j]);
                        }
                        else {
                            triples[stateA_concat_stateB] = [this.alphabet[j]];
                        }
                    }
                }
            }
            res = res.concat(Object.keys(triples).map(x => this.create_triple(x, triples[x].join(","))).join("\n"));
            console.log(res);
            res = res.concat("\nstyle START fill:#FFFFFF, stroke:#FFFFFF;");
            return res;
        }
        color_node(toFill) {
            let current_circle = this.get_current_graph_node(this.currentState);
            let next_circle = current_circle.nextSibling;
            if (toFill) {
                if (this.endState.includes(this.currentState))
                    next_circle.style.fill = '#009879';
                else
                    current_circle.style.fill = '#009879';
            }
            else {
                if (this.endState.includes(this.currentState))
                    next_circle.removeAttribute('style');
                else
                    current_circle.removeAttribute('style');
            }
        }
        create_triple(states, transition) {
            let split = states.split("&");
            let A = split[0], B = split[1];
            return `${A}((${A})) -->| ${transition} | ${B}((${B}))`;
        }
        create_entering_arrow() {
            return `START[ ]--> ${this.startState}`;
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
    exports.teachers = exports.teacherNotAfourthPos = exports.teacherEvenAandThreeB = exports.teacherA3fromLast = exports.teacherPairZeroAndOne = exports.Teacher = void 0;
    class Teacher {
        constructor(description, alphabet, f, counter_exemples) {
            this.max_word_length = 10;
            this.alphabet = alphabet;
            this.check_function = f;
            this.counter_exemples = counter_exemples;
            this.counter = 0;
            this.description = description;
            this.word_apperencance = [["", this.check_function("")]];
            this.initiate_mapping("");
            this.word_apperencance = this.word_apperencance.sort((a, b) => a[0].length - b[0].length);
        }
        initiate_mapping(word) {
            if (word.length > this.max_word_length)
                return;
            Array.from(this.alphabet).forEach(letter => {
                this.word_apperencance.push([word + letter, this.check_function(word + letter)]);
                this.initiate_mapping(word + letter);
            });
        }
        query(sentence) {
            return this.boolToString(this.check_function(sentence));
        }
        member(automaton) {
            let res = this.word_apperencance.find((word) => {
                return automaton.accept_word_nfa(word[0]) != word[1];
            });
            return res ? res[0] : res;
        }
        boolToString(bool) {
            return bool ? "1" : "0";
        }
    }
    exports.Teacher = Teacher;
    exports.teacherPairZeroAndOne = new Teacher(`Automata accepting L = {w in (0, 1)* | #(w_0) % 2 = 0 and #(w_1) % 2 = 0} 
    → w has even nb of "0" and even nb of "1"`, "01", sentence => {
        let parity = (0, Utilities_js_1.count_str_occurrences)(sentence, "0");
        return parity % 2 == 0 && sentence.length % 2 == 0;
    }, ["11", "011"]);
    exports.teacherA3fromLast = new Teacher(`Automata accepting L = {w in (a, b)* | w[-3] = a} 
    → w has an 'a' in the 3rd pos from end`, "ab", sentence => sentence.length >= 3 && sentence[sentence.length - 3] == 'a', ["aaa"]);
    exports.teacherEvenAandThreeB = new Teacher(`Automata accepting L = {w in (a, b)* | #(w_b) > 2 and #(w_a) % 2 = 0}
    → w has at least 3 'b' and an even nb of 'a'`, "ab", sentence => (0, Utilities_js_1.count_str_occurrences)(sentence, "b") >= 3 && (0, Utilities_js_1.count_str_occurrences)(sentence, "a") % 2 == 0, ["bbb", "ababb", "bbaab", "babba"]);
    exports.teacherNotAfourthPos = new Teacher(`Automata accepting L = {w in (a,b)* and i in N | w[4 * i] != a and 4 * i <= len(w)}
    → words without an "a" in a position multiple of 4`, "ab", sentence => {
        for (let i = 3; i < sentence.length; i += 4) {
            if (sentence.charAt(i) == "a")
                return false;
        }
        return true;
    }, ["aaaa", "baaa", "bbaaa", "bbbaaa"]);
    exports.teachers = [exports.teacherA3fromLast, exports.teacherEvenAandThreeB, exports.teacherNotAfourthPos, exports.teacherPairZeroAndOne];
});
define("L_star/L_star", ["require", "exports", "Automaton", "Utilities"], function (require, exports, Automaton_js_1, Utilities_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.L_star = void 0;
    class L_star {
        constructor(teacher) {
            this.finish = false;
            this.alphabet = Array.from(teacher.alphabet);
            this.teacher = teacher;
            this.query_number = 0;
            this.member_number = 0;
            this.E = [""];
            this.S = [""];
            this.SA = Array.from(this.alphabet);
            this.observation_table = {};
            this.add_row("");
            this.SA.forEach(elt => this.add_row(elt));
        }
        update_observation_table(key, value) {
            let old_value = this.observation_table[key];
            if (old_value != undefined)
                value = old_value + value;
            this.observation_table[key] = value;
        }
        make_query(pref, suff) {
            let word = pref + suff;
            let answer;
            for (let i = 0; i < word.length + 1; i++) {
                let pref1 = word.substring(0, i);
                let suff1 = word.substring(i);
                if (this.E.includes(suff1)) {
                    if ((this.S.includes(pref1) || this.SA.includes(pref1)) && this.observation_table[pref1]) {
                        console.log(pref1, suff1);
                        answer = this.observation_table[pref1].charAt(this.E.indexOf(suff1));
                        this.update_observation_table(pref, answer);
                        return;
                    }
                }
            }
            answer = this.teacher.query(word);
            console.log("pref", pref, "suff", suff);
            this.update_observation_table(pref, answer);
            this.query_number++;
        }
        make_member(a) {
            let answer = this.teacher.member(a);
            this.member_number++;
            return answer;
        }
        add_elt_in_S(new_elt) {
            let added_list = [];
            let prefix_list = (0, Utilities_js_2.generate_prefix_list)(new_elt);
            console.log(new_elt, "is going to be added in S, it has", prefix_list);
            for (const prefix of prefix_list) {
                if (this.S.includes(prefix))
                    return added_list;
                if (this.SA.includes(prefix)) {
                    this.move_from_SA_to_S(prefix);
                    this.alphabet.forEach(a => {
                        const new_word = prefix + a;
                        if (!this.SA.includes(new_word) && !this.S.includes(new_word)) {
                            this.add_row(new_word);
                            this.SA.push(new_word);
                            added_list.push(new_word);
                        }
                    });
                }
                else {
                    this.S.push(prefix);
                    this.add_row(prefix);
                    added_list.push(prefix);
                    this.alphabet.forEach(a => {
                        let new_word = prefix + a;
                        if (!this.SA.includes(new_word) && !this.S.includes(new_word)) {
                            this.SA.push(prefix + a);
                            this.add_row(prefix + a);
                            added_list.push(prefix + a);
                        }
                    });
                }
            }
            return added_list;
        }
        add_row(row_name) {
            this.E.forEach(e => this.make_query(row_name, e));
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
            let transitions = keys.map((k) => this.alphabet.map(a => {
                return [this.observation_table[states[k] + a]];
            }));
            return new Automaton_js_1.Automaton({
                "alphabet": this.alphabet,
                "endState": end_states,
                "startState": first_state,
                "states": keys,
                "transitions": transitions
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
define("NL_star/NL_star", ["require", "exports", "Automaton", "L_star/L_star", "Utilities"], function (require, exports, Automaton_js_2, L_star_js_1, Utilities_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NL_star = void 0;
    class NL_star extends L_star_js_1.L_star {
        constructor(teacher) {
            super(teacher);
            this.prime_lines = Array.from(this.alphabet).concat("");
        }
        is_prime(row_key) {
            if (this.prime_lines == undefined)
                this.prime_lines = [];
            let row_value = this.observation_table[row_key];
            if (row_key == "aa")
                console.log(row_key, row_value);
            if (this.prime_lines.includes(row_key) || row_value.length < 2 || parseInt(row_value) == 0)
                return true;
            if (row_key == "aa")
                console.log("Spep1");
            let res = "";
            for (let i = 0; i < row_value.length; i++)
                res += "0";
            Object.values(this.observation_table).forEach(value => {
                if (value != row_value && this.is_covered(value, row_value)) {
                    if (row_key == "aa")
                        console.log("sum of", res, "and", value, "is", this.row_union(res, value));
                    res = this.row_union(res, value);
                }
            });
            if (row_key == "aa")
                console.log("res and value : ", res, row_value, res != row_value);
            return res != row_value;
        }
        row_union(row1, row2) {
            return Array.from(row1).map((e, pos) => [e, row2.charAt(pos)].includes("1") ? "1" : "0").join("");
        }
        is_covered(row1, row2) {
            return Array.from(row1).every((e, pos) => e <= row2.charAt(pos));
        }
        update_prime_table() {
            Object.keys(this.observation_table).forEach(key => {
                if (!this.prime_lines?.includes(key) && this.is_prime(key)) {
                    this.prime_lines.push(key);
                }
            });
        }
        add_elt_in_S(new_elt) {
            let added_list = super.add_elt_in_S(new_elt);
            added_list.forEach(e => {
                if (!this.prime_lines?.includes(e) && this.is_prime(e)) {
                    this.prime_lines.push(e);
                }
            });
            return added_list;
        }
        add_elt_in_E(new_elt) {
            let suffix_list = (0, Utilities_js_3.generate_suffix_list)(new_elt);
            console.log(new_elt, "is going to be added in E, it has", suffix_list);
            for (const suffix of suffix_list) {
                if (this.E.includes(suffix))
                    return;
                this.SA.forEach(s => this.make_query(s, suffix));
                this.S.forEach(s => this.make_query(s, suffix));
                this.E.push(suffix);
            }
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
                        let first_unmacth = this.alphabet.find(a => !this.is_covered(value_s1 + a, value_s2 + a));
                        if (first_unmacth != undefined) {
                            console.log(`s1 = ${s1}, s2 = ${s2}, fu = ${first_unmacth}`, this.observation_table);
                            return [s1, s2, first_unmacth];
                        }
                    }
                }
            }
        }
        make_automaton() {
            let states = {};
            this.S.forEach(e => states[this.observation_table[e]] = e);
            let first_state = this.observation_table[""];
            let keys = Object.keys(states);
            let end_states = keys.filter(k => k[0] == '1');
            let transitions = keys.map((k) => this.alphabet.map(a => {
                return keys.filter(v => this.is_covered(v, this.observation_table[states[k] + a]));
            }));
            return new Automaton_js_2.Automaton({
                "alphabet": this.alphabet,
                "endState": end_states,
                "startState": first_state,
                "states": keys,
                "transitions": transitions
            });
        }
    }
    exports.NL_star = NL_star;
});
define("html_interactions/HTML_L_star", ["require", "exports", "Main", "L_star/L_star"], function (require, exports, Main_js_1, L_star_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTML_L_star = void 0;
    class HTML_L_star extends L_star_js_2.L_star {
        constructor(teacher) {
            super(teacher);
            console.log("Creating L* algo");
            this.table_header = Main_js_1.tableHTML.createTHead();
            this.table_body = Main_js_1.tableHTML.createTBody();
            this.pile_actions = [() => this.draw_table()];
        }
        draw_table() {
            this.add_row_html(this.table_header, "Table", undefined, this.E, 2);
            var fst = "S";
            for (var s of this.S) {
                const row = Array.from(this.observation_table[s]);
                this.add_row_html(this.table_body, fst, s, row, 1, fst ? this.S.length : 1);
                fst = undefined;
            }
            var fst = "SA";
            for (var s of this.SA) {
                const row = Array.from(this.observation_table[s]);
                this.add_row_html(this.table_body, fst, s, row, 1, fst ? this.SA.length : 1);
                fst = undefined;
            }
        }
        add_row_html(parent, fst, head, row_elts, colspan = 1, rowspan = 1) {
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
    exports.HTML_L_star = HTML_L_star;
});
define("html_interactions/HTML_NL_star", ["require", "exports", "Main", "NL_star/NL_star"], function (require, exports, Main_js_2, NL_star_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTML_NL_star = void 0;
    class HTML_NL_star extends NL_star_js_1.NL_star {
        constructor(teacher) {
            super(teacher);
            console.log("Creating NL* algo");
            this.table_header = Main_js_2.tableHTML.createTHead();
            this.table_body = Main_js_2.tableHTML.createTBody();
            this.pile_actions = [() => this.draw_table()];
        }
        draw_table() {
            this.add_row_html(this.table_header, "Table", undefined, this.E, 2);
            var fst = "S";
            for (var s of this.S) {
                const row = Array.from(this.observation_table[s]);
                this.add_row_html(this.table_body, fst, s, row, 1, fst ? this.S.length : 1);
                fst = undefined;
            }
            var fst = "SA";
            for (var s of this.SA) {
                const row = Array.from(this.observation_table[s]);
                this.add_row_html(this.table_body, fst, s, row, 1, fst ? this.SA.length : 1);
                fst = undefined;
            }
        }
        add_row_html(parent, fst, head, row_elts, colspan = 1, rowspan = 1) {
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
                if (Main_js_2.message.innerHTML != "")
                    Main_js_2.message.innerHTML = "The Teacher has accepted the automaton";
            }
            else if (this.pile_actions.length > 0) {
                this.pile_actions.shift()();
            }
            else if (!this.close_action()) { }
            else if (!this.consistence_action()) { }
            else
                this.send_automaton_action();
            Main_js_2.message.innerHTML =
                `Queries = ${this.query_number} - Membership = ${this.member_number} <br>
      ${Main_js_2.message.innerHTML}`;
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
            Main_js_2.automatonDiv.appendChild(input);
            Main_js_2.automatonDiv.appendChild(sendB);
            Main_js_2.automatonDiv.appendChild(setB);
        }
        close_action() {
            const close_rep = this.is_close();
            if (close_rep != undefined) {
                Main_js_2.message.innerText =
                    `The table is not closed since
        row(${close_rep}) = ${this.observation_table[close_rep]} but there is no s in S such that row(s) = ${this.observation_table[close_rep]};
        I'm going to move ${close_rep} from SA to S`;
                this.pile_actions.push(() => {
                    Main_js_2.message.innerText = "";
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
                Main_js_2.message.innerText =
                    `The table is not consistent : 
        row(${s1 ? s1 : "ε"}) and row(${s2 ? s2 : "ε"}) have same value in S,
        but their value is not the same if we add ${a} 
        row(${s1 + a}) != row(${s2 + a})
        I'm going to add the column ${new_col} since T(${s1 + new_col}) != T(${s2 + new_col})`;
                this.pile_actions.push(() => {
                    Main_js_2.message.innerText = "";
                    this.add_column(new_col);
                    this.clear_table();
                    this.draw_table();
                });
                return false;
            }
            return true;
        }
        send_automaton_action() {
            Main_js_2.message.innerText =
                `The table is consistent and closed, I will send an automaton`;
            let automaton = this.make_automaton();
            this.automaton = automaton;
            this.pile_actions.push(() => {
                Main_js_2.message.innerHTML = "";
                automaton.initiate_graph();
                this.add_automaton_listener();
                let answer = this.make_member(automaton);
                if (answer != undefined) {
                    Main_js_2.message.innerText =
                        `The sent automaton is not valid, 
          here is a counter-exemple ${answer}`;
                    this.pile_actions.push(() => {
                        Main_js_2.message.innerHTML = "";
                        (0, Main_js_2.clear_automaton_HTML)();
                        this.add_elt_in_E(answer);
                        this.clear_table();
                        this.draw_table();
                    });
                    return;
                }
                this.finish = true;
            });
        }
    }
    exports.HTML_NL_star = HTML_NL_star;
});
define("Main", ["require", "exports", "Teacher", "html_interactions/HTML_L_star", "html_interactions/HTML_NL_star"], function (require, exports, Teacher_js_1, HTML_L_star_js_1, HTML_NL_star_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.clear_automaton_HTML = exports.initiate_global_vars = exports.automatonHTML = exports.tableHTML = exports.message = exports.automatonDiv = void 0;
    function initiate_global_vars() {
        let listener = (teacher) => {
            exports.tableHTML.innerHTML = "";
            exports.message.innerHTML = "";
            clear_automaton_HTML();
            current_automaton = radioAlgo[0].checked ?
                new HTML_L_star_js_1.HTML_L_star(teacher) :
                new HTML_NL_star_js_1.HTML_NL_star(teacher);
            teacher_description_HTML.innerHTML = current_automaton.teacher.description;
        };
        exports.automatonHTML = document.getElementById("automaton-mermaid");
        exports.automatonDiv = document.getElementById("input-automaton");
        let button_next = document.getElementById("next_step");
        exports.message = document.getElementById("message");
        exports.tableHTML = document.getElementById("table");
        let current_automaton;
        let teacher_switch_HTML = document.getElementById("teacher_switch");
        let teacher_description_HTML = document.getElementById("teacher_description");
        let radioAlgo = Array.from(document.getElementsByClassName("algo-switch"));
        radioAlgo.forEach(e => {
            e.addEventListener("click", () => listener(current_automaton.teacher));
        });
        Teacher_js_1.teachers.forEach((teacher, pos) => {
            let radioTeacher = document.createElement("input");
            let label = document.createElement("label");
            let span = document.createElement("span");
            radioTeacher.type = 'radio';
            radioTeacher.name = 'teacher_switcher';
            span.innerHTML = pos + "";
            radioTeacher.addEventListener("click", () => {
                listener(teacher);
            });
            label.appendChild(radioTeacher);
            label.append(span);
            teacher_switch_HTML.appendChild(label);
            if (pos == 1) {
                radioTeacher.click();
            }
        });
        button_next.addEventListener("click", () => {
            current_automaton.graphic_next_step();
        });
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
define("models/automata", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.aut = void 0;
    exports.aut = {
        transitions: [
            [['0110'], ['0100']],
            [['1110'], ['1100']],
            [['0111'], ['0101']],
            [['1111'], ['1101']],
            [['0110'], ['0100']],
            [['0111'], ['0101']],
            [['1111'], ['1101']],
            [['1110'], ['1100']]
        ],
        startState: '0100',
        endState: ['1100', '1101', '1110', '1111'],
        alphabet: ['a', 'b'],
        states: [
            '1100', '1101',
            '1110', '1111',
            '0100', '0110',
            '0111', '0101'
        ]
    };
});
define("test_nodejs/L_star_test", ["require", "exports", "html_interactions/listeners", "L_star/L_star", "Teacher"], function (require, exports, listeners_js_1, L_star_js_3, Teacher_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let graphic = false;
    let lerner = new L_star_js_3.L_star(Teacher_js_2.teacherPairZeroAndOne);
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
define("test_nodejs/NL_star_test", ["require", "exports", "Automaton", "models/automata", "NL_star/NL_star", "Teacher"], function (require, exports, Automaton_js_3, automata_js_1, NL_star_js_2, Teacher_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let graphic = false;
    let lerner = new NL_star_js_2.NL_star(Teacher_js_3.teacherA3fromLast);
    if (false) {
        lerner.observation_table = {
            "": "0100",
            "a": "0110",
            "b": "0100",
            "ab": "0101",
            "aa": "0111"
        };
        console.log(lerner);
        lerner.update_prime_table();
        console.log(lerner);
    }
    else {
        for (let i = 0; i < 30; i++) {
            console.log(`/ ************* STEP ${i + 1} ************* /`);
            lerner.update_prime_table();
            if (lerner.define_next_questions()) {
                console.log("Making automaton :");
                let automaton = lerner.make_automaton();
                if (graphic) {
                    console.log(automaton.initiate_graph());
                }
                console.log(automaton);
                let answer = lerner.make_member(automaton);
                if (answer != undefined) {
                    lerner.add_elt_in_E(answer);
                }
                console.log("After member function : \n", lerner);
            }
            else {
                console.log(lerner);
            }
        }
    }
    console.log(new Automaton_js_3.Automaton(automata_js_1.aut).matrix_to_mermaid());
});
//# sourceMappingURL=out.js.map
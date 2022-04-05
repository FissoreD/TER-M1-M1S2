"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("automaton/Automaton", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Automaton = void 0;
    ;
    class Automaton {
        constructor(json) {
            this.transitions = json.transitions;
            this.startState = json.startState;
            this.acceptingStates = json.acceptingStates;
            this.currentStates = this.startState;
            this.alphabet = Array.from(json.alphabet);
            this.states = json.states;
            this.states_rename = [];
            let counter_init = [0, this.startState.length, this.states.length - this.acceptingStates.length + 1];
            for (let i = 0; i < this.states.length; i++) {
                if (this.startState.includes(this.states[i])) {
                    this.states_rename.push("q" + counter_init[0]++);
                }
                else if (this.acceptingStates.includes(this.states[i])) {
                    this.states_rename.push("q" + counter_init[2]++);
                }
                else {
                    this.states_rename.push("q" + counter_init[1]++);
                }
            }
        }
        next_step(next_char) {
            let newCurrentState = [];
            this.currentStates.forEach(cs => {
                let nextStates = this.find_transition(cs, next_char).toStates;
                nextStates.forEach(nextState => {
                    if (!newCurrentState.includes(nextState)) {
                        newCurrentState.push(nextState);
                    }
                });
            });
            this.currentStates = newCurrentState;
        }
        accept_word(word) {
            this.restart();
            Array.from(word).forEach(letter => this.next_step(letter));
            let is_accepted = this.acceptingStates.some(e => this.currentStates.includes(e));
            this.restart();
            return is_accepted;
        }
        find_transition(state, symbol) {
            return this.transitions
                .filter(e => e.fromState == state)
                .find(e => e.symbol == symbol);
        }
        accept_word_nfa(word) {
            let path = [];
            let recursive_explore = (word, index, current_state, state_path) => {
                if (index < word.length) {
                    let next_states = this.find_transition(current_state, word[index]).toStates;
                    return next_states.some(next_state => recursive_explore(word, index + 1, next_state, state_path + ", " + this.get_state_rename(next_state)));
                }
                else {
                    if (this.acceptingStates.includes(current_state)) {
                        path = [state_path];
                        return true;
                    }
                    path.push(state_path);
                    return false;
                }
            };
            let is_accepted = false;
            for (const start_state of this.startState) {
                is_accepted = recursive_explore(word, 0, start_state, this.get_state_rename(start_state));
                if (is_accepted)
                    break;
            }
            return [is_accepted, path];
        }
        restart() {
            this.currentStates = this.startState;
        }
        draw_next_step(next_char) {
            this.color_node(false);
            this.next_step(next_char);
            this.color_node(true);
        }
        initiate_graph() {
            let automatonHTML = $("#automaton-mermaid")[0];
            automatonHTML.removeAttribute('data-processed');
            automatonHTML.innerHTML = this.matrix_to_mermaid();
            mermaid.init($(".mermaid"));
            this.acceptingStates.forEach(n => {
                let circle = this.get_current_graph_node(n);
                circle.style.strokeWidth = "1.1";
                circle.style.stroke = "black";
                let smaller_circle = circle.cloneNode();
                smaller_circle.attributes['r'].value -= 4;
                circle.parentNode.insertBefore(smaller_circle, circle.nextSibling);
            });
            this.color_node(true);
            $(".mermaid")[0].after($(".mermaidTooltip")[0]);
            $('svg')[0].style.height = 'auto';
        }
        get_current_graph_node(node) {
            return Array.from($(".node")).find(e => e.id.split("-")[1] == node).firstChild;
        }
        matrix_to_mermaid() {
            let res = "flowchart LR\n";
            res = res.concat("subgraph Automaton\ndirection LR\n");
            let triples = {};
            for (let i = 0; i < this.states.length; i++) {
                for (let j = 0; j < this.alphabet.length; j++) {
                    for (const state of this.find_transition(this.states[i], this.alphabet[j]).toStates) {
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
            res += "\n";
            res += "subgraph InitialStates\n";
            res += this.startState.map(e => e).join("\n");
            res += "\nend";
            res += "\n";
            res += "end\n";
            res = res.concat(this.states.map(e => `click ${e} undefinedCallback "${e}";`).join("\n"));
            console.log(res);
            return res;
        }
        color_node(toFill) {
            this.currentStates.forEach(currentState => {
                let current_circle = this.get_current_graph_node(currentState);
                let next_circle = current_circle.nextSibling;
                if (toFill) {
                    next_circle.style.textDecoration = "underline";
                    if (this.acceptingStates.includes(currentState))
                        next_circle.style.fill = '#009879';
                    else
                        current_circle.style.fill = '#009879';
                }
                else {
                    if (this.acceptingStates.includes(currentState))
                        next_circle.removeAttribute('style');
                    else
                        current_circle.removeAttribute('style');
                }
            });
        }
        create_triple(states, transition) {
            let split = states.split("&");
            let A = split[0], B = split[1];
            let A_rename = this.get_state_rename(A);
            let B_rename = this.get_state_rename(B);
            return `${A}((${A_rename})) -->| ${transition} | ${B}((${B_rename}))`;
        }
        create_entering_arrow() {
            return `START[ ]--> ${this.startState}`;
        }
        get_state_rename(name) {
            return this.states_rename[this.states.indexOf(name)];
        }
    }
    exports.Automaton = Automaton;
});
define("automaton/automaton_type", ["require", "exports", "automaton/Automaton", "../../public/noam.js"], function (require, exports, Automaton_js_1, noam_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.differenceAutomata = exports.complementAutomata = exports.unionAutomata = exports.intersectionAutomata = exports.minimizeAutomaton = exports.regexToAutomaton = exports.MyAutomatonToHis = exports.HisAutomaton2Mine = void 0;
    function HisAutomaton2Mine(aut) {
        let res = {
            alphabet: Array.from(aut.alphabet),
            acceptingStates: aut.acceptingStates.map(e => e + ""),
            startState: (typeof aut.initialState === "number") ? [aut.initialState + ""] : Array.from(aut.initialState).map(e => e + ""),
            states: aut.states.map(e => e + ""),
            transitions: aut.transitions.map(e => ({ fromState: e.fromState + "", symbol: e.symbol, toStates: e.toStates.map(e => e + "") }))
        };
        return new Automaton_js_1.Automaton(res);
    }
    exports.HisAutomaton2Mine = HisAutomaton2Mine;
    function MyAutomatonToHis(aut) {
        let state2int = (state) => aut.states.indexOf(state);
        let states = aut.states.map(e => state2int(e));
        let startState = states.length;
        let transitions = aut.transitions.map(e => ({
            fromState: state2int(e.fromState), symbol: e.symbol, toStates: e.toStates.map(e => state2int(e))
        }));
        if (aut.startState.length > 1) {
            transitions.push(({
                fromState: startState,
                symbol: "$",
                toStates: aut.startState.map(e => state2int(e))
            }));
            states.push(startState);
        }
        else
            startState = state2int(aut.startState[0]);
        let res = {
            acceptingStates: aut.acceptingStates.map(e => state2int(e)),
            alphabet: Array.from(aut.alphabet),
            states: states,
            initialState: startState,
            transitions: transitions
        };
        return res;
    }
    exports.MyAutomatonToHis = MyAutomatonToHis;
    function regexToAutomaton(regex) {
        let res = noam_js_1.noam.fsm.minimize(noam_js_1.noam.fsm.convertEnfaToNfa(noam_js_1.noam.re.string.toAutomaton(regex)));
        return HisAutomaton2Mine(res);
    }
    exports.regexToAutomaton = regexToAutomaton;
    function minimizeAutomaton(automaton) {
        automaton = noam_js_1.noam.fsm.convertEnfaToNfa(automaton);
        automaton = noam_js_1.noam.fsm.convertNfaToDfa(automaton);
        automaton = noam_js_1.noam.fsm.minimize(automaton);
        return HisAutomaton2Mine(noam_js_1.noam.fsm.convertStatesToNumbers(automaton));
    }
    exports.minimizeAutomaton = minimizeAutomaton;
    function intersectionAutomata(a1, a2) {
        return minimizeAutomaton(noam_js_1.noam.fsm.intersection(MyAutomatonToHis(a1), MyAutomatonToHis(a2)));
    }
    exports.intersectionAutomata = intersectionAutomata;
    function unionAutomata(a1, a2) {
        let A1 = MyAutomatonToHis(a1);
        let A2 = MyAutomatonToHis(a2);
        let U = noam_js_1.noam.fsm.union(A1, A2);
        let res = minimizeAutomaton(U);
        return res;
    }
    exports.unionAutomata = unionAutomata;
    function complementAutomata(a1) {
        return minimizeAutomaton(noam_js_1.noam.fsm.complement(MyAutomatonToHis(a1)));
    }
    exports.complementAutomata = complementAutomata;
    function differenceAutomata(a1, a2) {
        let c = complementAutomata(a2);
        return intersectionAutomata(a1, c);
    }
    exports.differenceAutomata = differenceAutomata;
});
define("tools/Utilities", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.boolToString = exports.count_str_occurrences = exports.generate_suffix_list = exports.generate_prefix_list = exports.same_vector = void 0;
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
    function boolToString(bool) {
        return bool ? "1" : "0";
    }
    exports.boolToString = boolToString;
});
define("Teacher", ["require", "exports", "automaton/automaton_type", "tools/Utilities"], function (require, exports, automaton_type_js_1, Utilities_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.teachers = exports.binaryAddition = exports.teacher_b_bStar_a__b_aOrb_star = exports.teacher_bStar_a_or_aStart_bStar = exports.teacherNotAfourthPos = exports.teacherEvenAandThreeB = exports.teacherA3fromLast = exports.teacherPairZeroAndOne = exports.teacher_a_or_baStar = exports.Teacher = void 0;
    class Teacher {
        constructor(description, regex, f, counter_exemples) {
            this.counter_exemples_pos = 0;
            this.max_word_length = 8;
            this.check_function = f;
            this.counter_exemples = counter_exemples;
            this.counter = 0;
            this.description = description;
            this.automaton = (0, automaton_type_js_1.regexToAutomaton)(regex);
            this.alphabet = Array.from(this.automaton.alphabet);
            this.regex = regex;
        }
        initiate_mapping() {
            let res = [["", this.check_function("")]];
            let alphabet = Array.from(this.alphabet).sort();
            let level = [""];
            while (res[res.length - 1][0].length < this.max_word_length) {
                let res1 = [];
                level.forEach(e => alphabet.forEach(a => {
                    res.push([e + a, this.check_function(e + a)]);
                    res1.push(e + a);
                }));
                level = res1;
            }
            return res;
        }
        member(sentence) {
            return (0, Utilities_js_1.boolToString)(this.automaton.accept_word_nfa(sentence)[0]);
        }
        equiv(automaton) {
            if (this.counter_exemples_pos < this.counter_exemples.length) {
                return this.counter_exemples[this.counter_exemples_pos++];
            }
            let differenceAutomaton = (a, b) => {
                let difference = (0, automaton_type_js_1.differenceAutomata)(a, b);
                return difference;
            };
            let counterExemple = (automatonDiff) => {
                if (automatonDiff.acceptingStates.length == 0)
                    return undefined;
                let toExplore = [automatonDiff.startState[0]];
                let explored = [];
                let parent = new Array(automatonDiff.states.length).fill({ parent: "", symbol: "" });
                while (toExplore.length > 0) {
                    let current = toExplore.shift();
                    if (explored.includes(current))
                        continue;
                    explored.push(current);
                    for (const transition of automatonDiff.transitions) {
                        if (!explored.includes(transition.toStates[0]) && transition.fromState == current) {
                            parent[automatonDiff.states.indexOf(transition.toStates[0])] =
                                { parent: transition.fromState, symbol: transition.symbol };
                            toExplore.push(transition.toStates[0]);
                        }
                    }
                    if (automatonDiff.acceptingStates.includes(current)) {
                        let id = automatonDiff.states.indexOf(current);
                        let res = [parent[id].symbol];
                        while (parent[id].parent != "") {
                            id = automatonDiff.states.indexOf(parent[id].parent);
                            res.push(parent[id].symbol);
                        }
                        return res.reverse().join("");
                    }
                }
                return "";
            };
            let automMinimized = (0, automaton_type_js_1.minimizeAutomaton)((0, automaton_type_js_1.MyAutomatonToHis)(automaton));
            let diff1 = differenceAutomaton(this.automaton, automMinimized);
            let diff2 = differenceAutomaton(automMinimized, this.automaton);
            let counterEx1 = counterExemple(diff1);
            let counterEx2 = counterExemple(diff2);
            if (counterEx1 == undefined)
                return counterEx2;
            if (counterEx2 == undefined)
                return counterEx1;
            return counterEx1 < counterEx2 ? counterEx1 : counterEx2;
        }
    }
    exports.Teacher = Teacher;
    exports.teacher_a_or_baStar = new Teacher(`Automata accepting \\(regex(a + (ba)*)\\)`, "a+(ba)*", sentence => {
        let parity = (0, Utilities_js_1.count_str_occurrences)(sentence, "0");
        return parity % 2 == 0 && sentence.length % 2 == 0;
    }, []);
    exports.teacherPairZeroAndOne = new Teacher(`Automata accepting \\(L = \\{w \\in (0, 1)^* | \\#(w_0) \\% 2 = 0 \\land \\#(w_1) \\% 2 = 0\\}\\) <br/> → words with even nb of '0' and even nb of '1'`, "(00+11+(01+10)(00+11)*(01+10))*", sentence => {
        let parity = (0, Utilities_js_1.count_str_occurrences)(sentence, "0");
        return parity % 2 == 0 && sentence.length % 2 == 0;
    }, ["11", "011"]);
    exports.teacherA3fromLast = new Teacher(`Automata accepting \\(L = \\{w \\in (a, b)^* | w[-3] = a\\}\\) <br/>
    → words with an 'a' in the 3rd pos from end`, "(a+b)*a(a+b)(a+b)", sentence => sentence.length >= 3 && sentence[sentence.length - 3] == 'a', []);
    exports.teacherEvenAandThreeB = new Teacher(`Automata accepting \\(L = \\{w \\in (a, b)^* | \\#(w_b) \\geq 3 \\lor \\#(w_a) \\% 2 = 1\\}\\)
  <br/> → words with at least 3 'b' or an odd nb of 'a'`, "b*a(b+ab*a)*+(a+b)*ba*ba*b(a+b)*", sentence => (0, Utilities_js_1.count_str_occurrences)(sentence, "b") >= 3 || (0, Utilities_js_1.count_str_occurrences)(sentence, "a") % 2 == 1, []);
    exports.teacherNotAfourthPos = new Teacher(`Automata accepting \\(L = \\{w \\in (a,b)^* \\land i \\in 4\\mathbb{N} | w[i] \\neq a \\land i \\leq len(w)\\}\\) <br/>
  → words without an 'a' in a position multiple of 4`, "((a+b)(a+b)(a+b)b)*(a+b+$)(a+b+$)(a+b+$)", sentence => {
        for (let i = 3; i < sentence.length; i += 4) {
            if (sentence.charAt(i) == "a")
                return false;
        }
        return true;
    }, []);
    exports.teacher_bStar_a_or_aStart_bStar = new Teacher(`Automata accepting \\(L = regex((bb^*a) + (a^*b^*))\\)`, "(bb*a)+(a*b*)", sentence => {
        return sentence.match(/^((b+a)|(a*b*))$/g) != undefined;
    }, []);
    exports.teacher_b_bStar_a__b_aOrb_star = new Teacher(`Automata accepting \\(L = regex(bb^*($+a(b(a+b))^*)\\)`, "bb*($+a(b(a+b))*)", _sentence => true, []);
    exports.binaryAddition = new Teacher(`Automata accepting the sum between binary words, exemple : <br>
  <pre>
  0101 + 
  1001 = 
  1110 </pre>
  we encode this sum as the concatenation of vectors of size 3 : <br>
  <pre>
  fst column 011 = 3
  snd column 101 = 5 
  trd column 001 = 1 
  fth column 110 = 6 </pre>
  so 3516 which is a valid word for the sum <br>
  <input class="sum-calc sum-calc-style" onkeyup="update_input()"> + <br>
  <input class="sum-calc sum-calc-style" onkeyup="update_input()"> = <br>
  <input class="sum-calc sum-calc-style" onkeyup="update_input()"><br>
  <button id="calc" onclick="send_calc_button()">Send</button>
  <span class="sum-calc-style" id="add-res"></span>
  `, "((0+3+5)+1(7+4+2)*6)*", sentence => {
        let charToBin = (char) => (parseInt(char) >>> 0).toString(2).padStart(3, "0");
        let sentenceAr = Array.from(sentence).map(e => charToBin(e));
        let fst_term = parseInt(sentenceAr.map(e => e[0]).join(''), 2);
        let snd_term = parseInt(sentenceAr.map(e => e[1]).join(''), 2);
        let trd_term = parseInt(sentenceAr.map(e => e[2]).join(''), 2);
        return fst_term + snd_term == trd_term;
    }, []);
    exports.teachers = [exports.teacher_a_or_baStar, exports.teacher_b_bStar_a__b_aOrb_star, exports.binaryAddition, exports.teacherA3fromLast, exports.teacherEvenAandThreeB, exports.teacherNotAfourthPos, exports.teacherPairZeroAndOne, exports.teacher_bStar_a_or_aStart_bStar];
});
define("lerners/LernerBase", ["require", "exports", "tools/Utilities"], function (require, exports, Utilities_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LernerBase = void 0;
    class LernerBase {
        constructor(teacher) {
            this.finish = false;
            this.alphabet = Array.from(teacher.alphabet);
            this.teacher = teacher;
            this.member_number = 0;
            this.equiv_number = 0;
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
        make_member(pref, suff) {
            let word = pref + suff;
            let answer;
            for (let i = 0; i < word.length + 1; i++) {
                let pref1 = word.substring(0, i);
                let suff1 = word.substring(i);
                if (pref1 == pref)
                    continue;
                if (this.E.includes(suff1)) {
                    if ((this.S.includes(pref1) || this.SA.includes(pref1)) && this.observation_table[pref1]) {
                        answer = this.observation_table[pref1].charAt(this.E.indexOf(suff1));
                        this.update_observation_table(pref, answer);
                        if (answer == undefined)
                            throw 'Parameter is not a number!';
                        return;
                    }
                }
            }
            answer = this.teacher.member(word);
            this.update_observation_table(pref, answer);
            this.member_number++;
        }
        make_equiv(a) {
            let answer = this.teacher.equiv(a);
            this.equiv_number++;
            return answer;
        }
        add_elt_in_S(new_elt, after_member = false) {
            let added_list = [];
            let prefix_list = (0, Utilities_js_2.generate_prefix_list)(new_elt);
            for (const prefix of prefix_list) {
                if (this.S.includes(prefix))
                    return added_list;
                if (this.SA.includes(prefix)) {
                    this.move_from_SA_to_S(prefix);
                    this.alphabet.forEach(a => {
                        const new_word = prefix + a;
                        if (!this.SA.includes(new_word) && !this.S.includes(new_word)) {
                            this.add_row(new_word, after_member);
                            this.SA.push(new_word);
                            added_list.push(new_word);
                        }
                    });
                }
                else {
                    this.S.push(prefix);
                    this.add_row(prefix, after_member);
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
                after_member = false;
            }
            return added_list;
        }
        add_row(row_name, after_member = false) {
            this.E.forEach(e => {
                if (after_member && e == "")
                    this.observation_table[row_name] = (0, Utilities_js_2.boolToString)(!this.automaton.accept_word_nfa(row_name)[0]);
                else
                    this.make_member(row_name, e);
            });
        }
        move_from_SA_to_S(elt) {
            const index = this.SA.indexOf(elt);
            if (index != -1)
                this.SA.splice(index, 1);
            this.S.push(elt);
        }
        add_column(new_col) {
            let L = [this.SA, this.S];
            L.forEach(l => l.forEach(s => this.make_member(s, new_col)));
            this.E.push(new_col);
        }
        make_next_query() {
            if (this.finish)
                return;
            var close_rep;
            var consistence_rep;
            if (close_rep = this.is_close()) {
                this.add_elt_in_S(close_rep);
            }
            else if (consistence_rep = this.is_consistent()) {
                let new_col = consistence_rep[2];
                this.add_column(new_col);
            }
            else {
                let automaton = this.make_automaton();
                this.automaton = automaton;
                let answer = this.make_equiv(automaton);
                if (answer != undefined) {
                    this.table_to_update_after_equiv(answer);
                }
                else {
                    this.finish = true;
                }
            }
        }
        make_all_queries() {
            while (!this.finish) {
                this.make_next_query();
            }
        }
        same_row(a, b) {
            return this.observation_table[a] == this.observation_table[b];
        }
    }
    exports.LernerBase = LernerBase;
});
define("lerners/L_star", ["require", "exports", "automaton/Automaton", "lerners/LernerBase"], function (require, exports, Automaton_js_2, LernerBase_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.L_star = void 0;
    class L_star extends LernerBase_js_1.LernerBase {
        constructor(teacher) {
            super(teacher);
        }
        update_observation_table(key, value) {
            let old_value = this.observation_table[key];
            if (old_value != undefined)
                value = old_value + value;
            this.observation_table[key] = value;
        }
        make_member(pref, suff) {
            let word = pref + suff;
            let answer;
            for (let i = 0; i < word.length + 1; i++) {
                let pref1 = word.substring(0, i);
                let suff1 = word.substring(i);
                if (pref1 == pref)
                    continue;
                if (this.E.includes(suff1)) {
                    if ((this.S.includes(pref1) || this.SA.includes(pref1)) && this.observation_table[pref1]) {
                        answer = this.observation_table[pref1].charAt(this.E.indexOf(suff1));
                        this.update_observation_table(pref, answer);
                        if (answer == undefined)
                            throw 'Parameter is not a number!';
                        return;
                    }
                }
            }
            answer = this.teacher.member(word);
            this.update_observation_table(pref, answer);
            this.member_number++;
        }
        make_equiv(a) {
            let answer = this.teacher.equiv(a);
            this.equiv_number++;
            return answer;
        }
        make_automaton() {
            let states = {};
            this.S.forEach(e => states[this.observation_table[e]] = e);
            let first_state = this.observation_table[""];
            let keys = Object.keys(states);
            let end_states = keys.filter(k => k[0] == '1');
            let transitions = [];
            for (const state of this.S) {
                for (const symbol of this.alphabet) {
                    transitions.push({
                        fromState: this.observation_table[state],
                        symbol: symbol,
                        toStates: [this.observation_table[state + symbol]]
                    });
                }
            }
            this.automaton = new Automaton_js_2.Automaton({
                "alphabet": this.alphabet,
                "acceptingStates": end_states,
                "startState": [first_state],
                "states": keys,
                "transitions": transitions
            });
            return this.automaton;
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
                        for (const a of this.alphabet) {
                            for (let i = 0; i < this.E.length; i++) {
                                if (this.observation_table[s1 + a][i] !=
                                    this.observation_table[s2 + a][i] && !this.E.includes(a + this.E[i]))
                                    return [s1, s2, a + this.E[i]];
                            }
                        }
                    }
                }
            }
        }
        same_row(a, b) {
            return this.observation_table[a] == this.observation_table[b];
        }
        table_to_update_after_equiv(answer) {
            this.add_elt_in_S(answer);
        }
    }
    exports.L_star = L_star;
});
define("html_interactions/HTML_LernerBase", ["require", "exports", "Main"], function (require, exports, Main_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTML_LernerBase = void 0;
    class HTML_LernerBase {
        constructor(lerner) {
            this.table_counter = 0;
            this.lerner = lerner;
            this.table_header = Main_js_1.tableHTML.createTHead();
            this.table_body = Main_js_1.tableHTML.createTBody();
            this.pile_actions = [() => this.draw_table()];
        }
        draw_table() {
            this.add_row_html(this.table_header, "Table" + this.table_counter++, undefined, this.lerner.E, 2);
            var fst = "S";
            for (var s of this.lerner.S) {
                const row = Array.from(this.lerner.observation_table[s]);
                this.add_row_html(this.table_body, fst, s, row, 1, fst ? this.lerner.S.length : 1);
                fst = undefined;
            }
            var fst = "SA";
            for (var s of this.lerner.SA) {
                const row = Array.from(this.lerner.observation_table[s]);
                this.add_row_html(this.table_body, fst, s, row, 1, fst ? this.lerner.SA.length : 1);
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
            return row;
        }
        clear_table() {
            this.table_body.innerHTML = "";
            this.table_header.innerHTML = "";
        }
        graphic_next_step() {
            if (this.lerner.finish) {
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
                `Queries = ${this.lerner.member_number} - Membership = ${this.lerner.equiv_number} <br>
      ${Main_js_1.message.innerHTML}`;
            MathJax.typeset();
        }
        close_action() {
            const close_rep = this.lerner.is_close();
            if (close_rep != undefined) {
                Main_js_1.message.innerText =
                    this.close_message(close_rep);
                this.pile_actions.push(() => {
                    Main_js_1.message.innerText = "";
                    this.lerner.add_elt_in_S(close_rep);
                    this.clear_table();
                    this.draw_table();
                });
                return false;
            }
            return true;
        }
        consistence_action() {
            const consistence_rep = this.lerner.is_consistent();
            if (consistence_rep != undefined) {
                let s1 = consistence_rep[0];
                let s2 = consistence_rep[1];
                let new_col = consistence_rep[2];
                Main_js_1.message.innerText = this.consistent_message(s1, s2, new_col);
                this.pile_actions.push(() => {
                    Main_js_1.message.innerText = "";
                    this.lerner.add_column(new_col);
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
            let automaton = this.lerner.make_automaton();
            this.automaton = automaton;
            this.pile_actions.push(() => {
                Main_js_1.message.innerHTML = "";
                automaton.initiate_graph();
                this.add_automaton_listener();
                let answer = this.lerner.make_equiv(automaton);
                if (answer != undefined) {
                    Main_js_1.message.innerText =
                        `The sent automaton is not valid, 
          here is a counter-exemple ${answer}`;
                    this.pile_actions.push(() => {
                        Main_js_1.message.innerHTML = "";
                        (0, Main_js_1.clear_automaton_HTML)();
                        this.table_to_update_after_equiv(answer);
                        this.clear_table();
                        this.draw_table();
                    });
                    return;
                }
                this.lerner.finish = true;
            });
        }
        add_automaton_listener() {
            let input = document.createElement("input");
            let setB = document.createElement("button");
            setB.innerHTML = "Reinitialize automaton";
            setB.addEventListener('click', () => {
                this.automaton.restart();
                this.automaton.initiate_graph();
            });
            let nextB = document.createElement("button");
            nextB.innerHTML = "Next char";
            nextB.addEventListener('click', () => {
                this.automaton.draw_next_step(input.value[0]);
                input.value = input.value.slice(1);
            });
            Main_js_1.automatonDiv.appendChild(input);
            Main_js_1.automatonDiv.appendChild(nextB);
            Main_js_1.automatonDiv.appendChild(setB);
            let acceptB = document.createElement("button");
            let answerP = document.createElement("p");
            acceptB.innerHTML = "In automaton";
            acceptB.addEventListener("click", () => {
                let aut_answer = this.automaton?.accept_word_nfa(input.value);
                if (aut_answer[0]) {
                    answerP.innerHTML = `The word ${input.value} is accepted, here is a valid path : ${aut_answer[1]}`;
                }
                else {
                    answerP.innerHTML = `There is no valid path accepting the word ${input.value}`;
                }
            });
            Main_js_1.automatonDiv.appendChild(acceptB);
            Main_js_1.automatonDiv.appendChild(answerP);
        }
        go_to_end() {
            this.lerner.make_all_queries();
            this.clear_table();
            this.draw_table();
            (0, Main_js_1.clear_automaton_HTML)();
            this.lerner.automaton?.initiate_graph();
        }
    }
    exports.HTML_LernerBase = HTML_LernerBase;
});
define("html_interactions/HTML_L_star", ["require", "exports", "lerners/L_star", "html_interactions/HTML_LernerBase"], function (require, exports, L_star_js_1, HTML_LernerBase_js_1) {
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
define("lerners/NL_star", ["require", "exports", "automaton/Automaton", "tools/Utilities", "lerners/LernerBase"], function (require, exports, Automaton_js_3, Utilities_js_3, LernerBase_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NL_star = void 0;
    class NL_star extends LernerBase_js_2.LernerBase {
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
            let suffix_list = (0, Utilities_js_3.generate_suffix_list)(new_elt);
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
            this.automaton = new Automaton_js_3.Automaton({
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
define("html_interactions/HTML_NL_star", ["require", "exports", "lerners/NL_star", "html_interactions/HTML_LernerBase"], function (require, exports, NL_star_js_1, HTML_LernerBase_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTML_NL_star = void 0;
    class HTML_NL_star extends HTML_LernerBase_js_2.HTML_LernerBase {
        constructor(teacher) {
            super(new NL_star_js_1.NL_star(teacher));
        }
        add_row_html(parent, fst, head, row_elts, colspan = 1, rowspan = 1) {
            let row = super.add_row_html(parent, fst, head, row_elts, colspan, rowspan);
            if (head != undefined && this.lerner.prime_lines.includes(head)) {
                row.className += "prime-row";
            }
            return row;
        }
        close_message(close_rep) {
            return `
    The table is not closed since
    \\(\\{row(${close_rep}) = ${this.lerner.observation_table[close_rep]} \\land ${close_rep} \\in SA\\}\\) but \\(\\{\\nexists s \\in S | row(s) \\sqsupseteq ${this.lerner.observation_table[close_rep]}\\}\\)
    I'm going to move "${close_rep}" from SA to S`;
        }
        consistent_message(s1, s2, new_col) {
            return `
    The table is not consistent :
    take \\(${s1 ? s1 : "ε"}\\in S \\land ${s2 ? s2 : "ε"} \\in S \\land ${new_col[0]} \\in \\Sigma \\)
    \\(\\{row(${s1 ? s1 : "ε"}) \\sqsubseteq row(${s2 ? s2 : "ε"})\\}\\)
    but \\(\\{row(${s1 ? s1 : "ε"} \\circ ${new_col[0]}) \\not\\sqsubseteq row(${s2 ? s2 : "ε"} \\circ ${new_col[0]})\\}\\)
    I'm going to add the column \\(${new_col} \\in \\Sigma \\circ E\\) since \\(T(${s1 ? s1 : "ε"} \\circ ${new_col}) > T(${s2 ? s2 : "ε"} \\circ ${new_col})\\)`;
        }
        table_to_update_after_equiv(answer) {
            this.lerner.add_elt_in_E(answer);
        }
    }
    exports.HTML_NL_star = HTML_NL_star;
});
define("Main", ["require", "exports", "Teacher", "html_interactions/HTML_L_star", "html_interactions/HTML_NL_star", "automaton/Automaton", "lerners/L_star", "lerners/NL_star", "automaton/automaton_type"], function (require, exports, Teacher_js_1, HTML_L_star_js_1, HTML_NL_star_js_1, Automaton_js_4, L_star_js_2, NL_star_js_2, autFunction) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.clear_automaton_HTML = exports.initiate_global_vars = exports.automatonDivList = exports.automatonHTML = exports.tableHTML = exports.message = exports.automatonDiv = void 0;
    autFunction = __importStar(autFunction);
    exports.automatonDivList = [];
    function initiate_global_vars() {
        exports.automatonHTML = $("#automaton-mermaid")[0];
        exports.automatonDiv = $("#input-automaton")[0];
        exports.message = $("#message")[0];
        exports.tableHTML = $("#table")[0];
        let current_automaton, teacherSelector = $("#teacher-switch")[0], teacherDescription = $("#teacher_description")[0], algoSelector = Array.from($(".algo-switch")), mapTeacherValue = {}, counter = 0, currentTeacher = Teacher_js_1.teachers[0], newRegex = $("#input-regex")[0], newRegexSendButton = $("#button-regex")[0];
        let changeTeacherOrAlgo = () => {
            exports.tableHTML.innerHTML = "";
            exports.message.innerHTML = "";
            clear_automaton_HTML();
            current_automaton = algoSelector[0].checked ?
                new HTML_L_star_js_1.HTML_L_star(currentTeacher) :
                new HTML_NL_star_js_1.HTML_NL_star(currentTeacher);
            teacherDescription.innerHTML = current_automaton.lerner.teacher.description;
            MathJax.typeset();
        };
        let createRadioTeacher = (teacher) => {
            let newTeacherHtml = document.createElement("option");
            newTeacherHtml.value = counter + "";
            newTeacherHtml.text = teacher.regex;
            mapTeacherValue["" + counter++] = teacher;
            teacherSelector.appendChild(newTeacherHtml);
            return newTeacherHtml;
        };
        changeTeacherOrAlgo();
        teacherSelector.onchange = () => {
            currentTeacher = mapTeacherValue[teacherSelector.selectedOptions[0].value];
            changeTeacherOrAlgo();
        };
        algoSelector.forEach(as => as.onclick = () => changeTeacherOrAlgo());
        Teacher_js_1.teachers.forEach((teacher) => createRadioTeacher(teacher));
        $("#next_step")[0].addEventListener("click", () => current_automaton.graphic_next_step());
        $("#go_to_end")[0].addEventListener("click", () => current_automaton.go_to_end());
        newRegexSendButton.addEventListener("click", () => {
            let regexAlreadyExists = Array.from($("#teacher-switch option")).find(e => e.text == newRegex.value);
            let newTeacherOption;
            if (regexAlreadyExists) {
                newTeacherOption = regexAlreadyExists;
            }
            else {
                currentTeacher = new Teacher_js_1.Teacher(`My automaton with regex = (${newRegex.value})`, newRegex.value, _s => true, []);
                newTeacherOption = createRadioTeacher(currentTeacher);
            }
            newTeacherOption.selected = true;
            changeTeacherOrAlgo();
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
    }
    catch (e) {
        window.onload = function () {
            initiate_global_vars();
            resizableGrid($(".mainTable")[0]);
        };
        window.Automaton = Automaton_js_4.Automaton;
        window.Teacher = Teacher_js_1.Teacher;
        window.teachers = Teacher_js_1.teachers;
        window.L_star = L_star_js_2.L_star;
        window.NL_star = NL_star_js_2.NL_star;
        window.autFunction = autFunction;
        window.automatonDivList = exports.automatonDivList;
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
define("html_interactions/listeners", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.set_text = exports.listener_automaton_click_button = void 0;
    function listener_automaton_click_button(a) {
        let next_char = () => {
            let dom = $('#input')[0];
            let name = dom.innerText;
            let currentNode = name[0];
            name = name.substring(1);
            a.draw_next_step(currentNode);
            dom.innerText = name;
        };
        let x = $("#next_char")[0];
        x.addEventListener("click", next_char);
    }
    exports.listener_automaton_click_button = listener_automaton_click_button;
    function set_text() {
        let form = $("#form1")[0];
        let str = form.getAttribute("id");
        $("#input")[0].innerText = str;
    }
    exports.set_text = set_text;
});
define("lerners/Observation_table", ["require", "exports", "tools/Utilities"], function (require, exports, Utilities_js_4) {
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
                (0, Utilities_js_4.same_vector)(r1, r2);
        }
    }
    exports.Observation_table = Observation_table;
});
define("test_nodejs/LernerCompare", ["require", "exports", "lerners/NL_star", "lerners/L_star", "Teacher", "assert/strict"], function (require, exports, NL_star_js_3, L_star_js_3, Teacher_js_2, strict_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    strict_1 = __importDefault(strict_1);
    let compare = (a, b) => {
        let printInfo = (algoName, algo) => {
            return `${algoName} : queries = ${algo.member_number}, equiv = ${algo.equiv_number}, states = ${algo.automaton?.states.length}`;
        };
        (0, strict_1.default)(a.teacher == b.teacher);
        console.log(printInfo("L Star", a));
        console.log(printInfo("NL Star", b));
    };
    for (const teacher of Teacher_js_2.teachers) {
        let lernerL = new L_star_js_3.L_star(teacher);
        let lernerNL = new NL_star_js_3.NL_star(teacher);
        console.log("==============================");
        console.log("Current regexp : ", teacher.regex);
        lernerL.make_all_queries();
        lernerNL.make_all_queries();
        compare(lernerL, lernerNL);
    }
});
//# sourceMappingURL=out.js.map
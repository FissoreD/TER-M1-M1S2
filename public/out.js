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
define("tools/Utilities", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.myLog = exports.allStringFromAlphabet = exports.boolToString = exports.count_str_occurrences = exports.generate_suffix_list = exports.generate_prefix_list = exports.same_vector = void 0;
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
    function allStringFromAlphabet(params) {
        let res = [""];
        let alphabet = Array.from(params.alphabet).sort();
        let level = [""];
        while (res[res.length - 1].length < params.maxLength) {
            let res1 = [];
            level.forEach(e => alphabet.forEach(a => {
                res.push(e + a);
                res1.push(e + a);
            }));
            level = res1;
        }
        return res;
    }
    exports.allStringFromAlphabet = allStringFromAlphabet;
    let myLog = ({ a, toLog = false }) => {
        if (toLog)
            console.log(...a);
    };
    exports.myLog = myLog;
});
define("automaton/Automaton", ["require", "exports", "tools/Utilities"], function (require, exports, Utilities_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Automaton = exports.State = void 0;
    class State {
        constructor(name, isAccepting, isInitial, alphabet) {
            this.name = name;
            this.isAccepting = isAccepting;
            this.isInitial = isInitial;
            this.alphabet = Array.from(alphabet);
            this.outTransitions = new Map();
            this.inTransitions = new Map();
            this.successors = new Set();
            this.predecessor = new Set();
            for (const symbol of alphabet) {
                this.outTransitions.set(symbol, []);
                this.inTransitions.set(symbol, []);
            }
        }
        addTransition(symbol, state) {
            if (this.outTransitions.get(symbol).includes(state))
                return;
            this.outTransitions.get(symbol).push(state);
            this.successors.add(state);
            state.predecessor.add(this);
            state.inTransitions.get(symbol).push(this);
        }
        getSuccessor(symbol) {
            return this.outTransitions.get(symbol);
        }
        getPredecessor(symbol) {
            return this.inTransitions.get(symbol);
        }
        static bottom(alphabet) {
            return new State("bottom", false, false, alphabet);
        }
    }
    exports.State = State;
    ;
    class Automaton {
        constructor(stateList) {
            this.continueAction = true;
            stateList = new Set(stateList);
            this.complete(stateList);
            this.allStates = Array.from(stateList);
            this.initialStates = this.allStates.filter(s => s.isInitial);
            this.acceptingStates = this.allStates.filter(s => s.isAccepting);
            this.currentStates = this.initialStates;
            this.alphabet = this.initialStates[0].alphabet;
            this.states = new Map();
            stateList.forEach(e => this.states.set(e.name, e));
            this.states_rename = new Map();
            this.set_state_rename();
        }
        complete(stateList) {
            let alphabet = stateList.values().next().value.alphabet;
            let bottom = State.bottom(alphabet);
            for (const state of stateList) {
                for (const symbol of alphabet) {
                    if (this.findTransition(state, symbol).length == 0) {
                        stateList.add(bottom);
                        state.addTransition(symbol, bottom);
                    }
                }
            }
        }
        set_state_rename() {
            let counter_init = [0, this.initialStates.length, this.states.size - this.acceptingStates.length + 1];
            for (const [_name, state] of this.states) {
                if (this.initialStates.includes(state)) {
                    this.states_rename.set(state.name, "q" + counter_init[0]++);
                }
                else if (this.acceptingStates.includes(state)) {
                    this.states_rename.set(state.name, "q" + counter_init[2]++);
                }
                else {
                    this.states_rename.set(state.name, "q" + counter_init[1]++);
                }
            }
        }
        next_step(next_char) {
            if (next_char == undefined)
                return;
            let newCurrentState = [];
            this.currentStates.forEach(cs => {
                let nextStates = cs.outTransitions.get(next_char);
                if (nextStates) {
                    nextStates.forEach(nextState => {
                        if (!newCurrentState.includes(nextState)) {
                            newCurrentState.push(nextState);
                        }
                    });
                }
                else {
                    alert("The letter you entered in not in the alphabet !\n The automaton has been reinitialized");
                    this.restart_graph();
                    return;
                }
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
        accept_word_nfa(word) {
            if (word.length == 0)
                return this.initialStates.some(e => e.isAccepting);
            let nextStates = new Set(this.initialStates);
            for (let index = 0; index < word.length && nextStates.size > 0; index++) {
                let nextStates2 = new Set();
                const symbol = word[index];
                if (!this.alphabet.includes(symbol)) {
                    alert("The word you entered contains a letter which is not in the alphabet !\nThe automaton has been reinitialized");
                    return false;
                }
                for (const state of nextStates) {
                    for (const nextState of this.findTransition(state, symbol)) {
                        nextStates2.add(nextState);
                        if (index == word.length - 1 && nextState.isAccepting)
                            return true;
                    }
                }
                nextStates = nextStates2;
            }
            return false;
        }
        findTransition(state, symbol) {
            return state.outTransitions.get(symbol);
        }
        restart() {
            this.currentStates = this.initialStates;
        }
        draw_next_step(next_char) {
            this.color_node(false);
            this.next_step(next_char);
            this.color_node(true);
        }
        initiate_graph() {
            this.continueAction = false;
            document.getElementById('automatonHead')?.classList.remove('up');
            let txt = this.automatonToDot();
            return d3.select("#graph").graphviz()
                .dot(txt).zoom(false)
                .render(() => {
                this.continueAction = true;
                this.color_node(true);
            });
        }
        restart_graph() {
            this.color_node(false);
            this.restart();
            this.color_node(true);
        }
        get_current_graph_node(node) {
            let text = Array.from($('.node title')).find(e => e.innerHTML == node.name);
            return text.nextSibling?.nextSibling;
        }
        matrix_to_mermaid() {
            let mermaidTxt = "flowchart LR\n";
            mermaidTxt = mermaidTxt.concat("\ndirection LR\n");
            let triples = {};
            for (const [name, state] of this.states) {
                for (let j = 0; j < this.alphabet.length; j++) {
                    for (const nextState of this.findTransition(state, this.alphabet[j])) {
                        let stateA_concat_stateB = name + '&' + nextState.name;
                        if (triples[stateA_concat_stateB]) {
                            triples[stateA_concat_stateB].push(this.alphabet[j]);
                        }
                        else {
                            triples[stateA_concat_stateB] = [this.alphabet[j]];
                        }
                    }
                }
            }
            mermaidTxt = mermaidTxt.concat(Object.keys(triples).map(x => this.create_triple(x, triples[x].join(","))).join("\n"));
            mermaidTxt += "\n";
            mermaidTxt += "\nsubgraph InitialStates\n";
            mermaidTxt += this.initialStates.map(e => e.name).join("\n");
            mermaidTxt += "\nend";
            mermaidTxt += "\n";
            mermaidTxt = mermaidTxt.concat(this.acceptingStates.map(e => `style ${e.name} fill:#FFFF00, stroke:#FF00FF;\n`).join(""));
            mermaidTxt += "\n";
            mermaidTxt = mermaidTxt.concat(Array.from(this.states).map(([name, _]) => `click ${name} undnamefinedCallback "${name}";`).join("\n"));
            (0, Utilities_js_1.myLog)({ a: [mermaidTxt] });
            this.automatonToDot();
            return mermaidTxt;
        }
        automatonToDot() {
            let txt = "digraph {rankdir = LR\n";
            let triples = {};
            for (const [name, state] of this.states) {
                for (let j = 0; j < this.alphabet.length; j++) {
                    for (const nextState of this.findTransition(state, this.alphabet[j])) {
                        let stateA_concat_stateB = name + '&' + nextState.name;
                        if (triples[stateA_concat_stateB]) {
                            triples[stateA_concat_stateB].push(this.alphabet[j]);
                        }
                        else {
                            triples[stateA_concat_stateB] = [this.alphabet[j]];
                        }
                    }
                }
            }
            txt = txt.concat(this.allStates.map(e => `${e.name} [label="${this.get_state_rename(e.name)}", shape=circle]`).join("\n"));
            txt += '\n';
            txt = txt.concat(Object.keys(triples).map(x => {
                let [states, transition] = [x, triples[x].join(",")];
                let split = states.split("&");
                let A = split[0], B = split[1];
                return `${A} -> ${B} [label = "${transition}"]`;
            }).join("\n"));
            this.initialStates.forEach(s => {
                txt = txt.concat(`\nI${s.name} [label="", style=invis, width=0]\nI${s.name} -> ${s.name}`);
            });
            this.acceptingStates.forEach(s => {
                txt = txt.concat(`\n${s.name} [shape=doublecircle]`);
                (0, Utilities_js_1.myLog)({ a: ["here"] });
            });
            txt += "\n}";
            console.log(txt);
            return txt;
        }
        color_node(toFill) {
            this.currentStates.forEach(currentState => {
                let current_circle = this.get_current_graph_node(currentState);
                if (toFill) {
                    current_circle.classList.add('currentNode');
                }
                else {
                    current_circle.classList.remove('currentNode');
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
            return `START[ ]--> ${this.initialStates}`;
        }
        get_state_rename(name) {
            return this.states_rename.get(name);
        }
        state_number() {
            return this.states.size;
        }
        transition_number() {
            return Array.from(this.states).map(e => Array.from(e[1].outTransitions)).flat().reduce((a, b) => a + b[1].length, 0);
        }
        minimize() {
            let stateList = [this.initialStates[0]];
            let toExplore = [this.initialStates[0]];
            while (toExplore.length > 0) {
                let newState = toExplore.shift();
                for (const successor of newState.successors) {
                    if (!stateList.includes(successor)) {
                        toExplore.push(successor);
                        stateList.push(successor);
                    }
                }
            }
            let P = [new Set(), new Set()];
            stateList.forEach(s => (s.isAccepting ? P[0] : P[1]).add(s));
            P = P.filter(p => p.size > 0);
            let pLength = () => P.reduce((a, p) => a + p.size, 0);
            let W = Array.from(P);
            while (W.length > 0) {
                let A = W.shift();
                for (const letter of this.alphabet) {
                    let X = new Set();
                    A.forEach(e => {
                        let succ = e.inTransitions.get(letter);
                        if (succ)
                            succ.forEach(s => X.add(s));
                    });
                    let Y = P.map(p => {
                        let S1 = new Set(), S2 = new Set();
                        for (const state of p) {
                            if (X.has(state))
                                S1.add(state);
                            else
                                S2.add(state);
                        }
                        return { y: p, S1: S1, S2: S2 };
                    }).filter(({ S1, S2 }) => S1.size > 0 && S2.size > 0);
                    for (const { y, S1, S2 } of Y) {
                        P.splice(P.indexOf(y), 1);
                        P.push(S1);
                        P.push(S2);
                        if (pLength() != stateList.length)
                            throw `Wanted ${stateList.length} had ${pLength()}`;
                        if (W.includes(y)) {
                            W.splice(W.indexOf(y), 1);
                            W.push(S1);
                            W.push(S2);
                        }
                        else {
                            if (S1.size <= S2.size) {
                                W.push(S1);
                            }
                            else {
                                W.push(S2);
                            }
                        }
                    }
                }
            }
            let oldStateToNewState = new Map();
            let newStates = new Set(Array.from(P).filter(partition => partition.size > 0).map((partition, pos) => {
                let representant = Array.from(partition);
                let newState = new State(pos + "", representant.some(e => e.isAccepting), representant.some(e => e.isInitial), representant[0].alphabet);
                partition.forEach(state => oldStateToNewState.set(state, newState));
                return newState;
            }));
            for (const partition of P) {
                for (const oldState of partition) {
                    for (const letter of this.alphabet) {
                        for (const successor of oldState.getSuccessor(letter)) {
                            if (!oldStateToNewState.get(oldState).outTransitions.get(letter)[0] || (oldStateToNewState.get(oldState).outTransitions.get(letter)[0].name != oldStateToNewState.get(successor).name))
                                oldStateToNewState.get(oldState).addTransition(letter, oldStateToNewState.get(successor));
                        }
                    }
                }
            }
            return new Automaton(newStates);
        }
        static strToAutomaton(content) {
            const SYMBOL_LIST = Array.from("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
            let sContent = content.split("\n");
            let IN_INITIAL = 0, IN_TRANSITION = 1, IN_ACCEPTING = 2;
            let statePhase = IN_INITIAL;
            const initalState = [], acceptingStates = [], transitions = [], statesName = new Set(), alphabetSet = new Set();
            for (const line of sContent) {
                if (!line.includes("-")) {
                    let stateName = line.substring(line.indexOf('[') + 1, line.indexOf(']'));
                    statesName.add(stateName);
                    if (statePhase == IN_INITIAL) {
                        initalState.push(stateName);
                    }
                    else {
                        statePhase = IN_ACCEPTING;
                        acceptingStates.push(stateName);
                    }
                }
                else if (line.match(/[a-zA-Z0-9]+/)) {
                    statePhase = IN_TRANSITION;
                    let split = line.match(/[A-Za-z0-9]+/g);
                    let current = split[1];
                    let symbol = split[0];
                    let next = split[2];
                    transitions.push({
                        current: current,
                        next: next,
                        symbol: symbol
                    });
                    statesName.add(current);
                    statesName.add(next);
                    alphabetSet.add(symbol);
                }
            }
            let alphabet = Array.from(alphabetSet);
            let alphabetOneLetter = SYMBOL_LIST.splice(0, alphabet.length);
            let stateMap = new Map();
            let stateSet = new Set();
            statesName.forEach(e => {
                let state = new State(e, acceptingStates.includes(e), initalState.includes(e), alphabetOneLetter);
                stateMap.set(e, state);
                stateSet.add(state);
            });
            transitions.forEach(({ current, symbol, next }) => stateMap.get(current).addTransition(alphabetOneLetter[alphabet.indexOf(symbol)], stateMap.get(next)));
            let automaton = new Automaton(stateSet);
            return automaton;
        }
        toString() {
            let txt = [];
            this.initialStates.forEach(e => txt.push('[' + e.name + "]"));
            this.allStates.forEach(state => state.outTransitions.forEach((nextStates, symbol) => nextStates.forEach(next => txt.push(`${symbol},[${state.name}]->[${next.name}]`))));
            this.acceptingStates.forEach(e => txt.push("[" + e.name + "]"));
            return txt.join('\n');
        }
    }
    exports.Automaton = Automaton;
});
define("automaton/automaton_type", ["require", "exports", "automaton/Automaton", "../../public/noam.js", "tools/Utilities"], function (require, exports, Automaton_js_1, noam_js_1, Utilities_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.differenceAutomata = exports.complementAutomata = exports.unionAutomata = exports.intersectionAutomata = exports.minimizeAutomaton = exports.regexToAutomaton = exports.MyAutomatonToHis = exports.HisAutomaton2Mine = void 0;
    function HisAutomaton2Mine(aut) {
        let states = aut.states.map(e => new Automaton_js_1.State(e + "", aut.acceptingStates.some(x => x + "" == e + ""), (typeof aut.initialState == "number" ? aut.initialState + "" == e + "" : aut.initialState?.some(x => x + "" == e + "")) || false, aut.alphabet));
        let statesMap = new Map(), statesSet = new Set();
        for (const state of states) {
            statesMap.set(state.name, state);
            statesSet.add(state);
        }
        for (const transition of aut.transitions) {
            let from = transition.fromState;
            let symbol = transition.symbol;
            let to = transition.toStates;
            to.forEach(state => statesMap.get(from + "")?.addTransition(symbol, statesMap.get(state + "")));
        }
        return new Automaton_js_1.Automaton(statesSet);
    }
    exports.HisAutomaton2Mine = HisAutomaton2Mine;
    function MyAutomatonToHis(aut) {
        let stateList = Array.from(aut.states).map(e => e[1]);
        let state2int = (state) => stateList.indexOf(state);
        let states = stateList.map(e => state2int(e));
        let startState = states.length;
        let transitions = stateList.map(state => Array.from(state.outTransitions).map(transition => ({
            fromState: state2int(state),
            symbol: transition[0],
            toStates: transition[1].map(e => state2int(e))
        })).flat()).flat();
        if (aut.initialStates.length > 1) {
            transitions.push(({
                fromState: startState,
                symbol: "$",
                toStates: aut.initialStates.map(e => state2int(e))
            }));
            states.push(startState);
        }
        else
            startState = state2int(aut.initialStates[0]);
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
        let res = noam_js_1.noam.re.string.toAutomaton(regex);
        return minimizeAutomaton(res);
    }
    exports.regexToAutomaton = regexToAutomaton;
    function minimizeAutomaton(automatonInput) {
        let automaton = automatonInput instanceof Automaton_js_1.Automaton ?
            MyAutomatonToHis(automatonInput) : automatonInput;
        let log = (message, aut) => {
            (0, Utilities_js_2.myLog)({ a: [message, automaton.states.length] });
            if ((aut instanceof Automaton_js_1.Automaton ? aut.state_number() : aut.states.length) > 5000)
                console.error(message, automaton.states.length);
        };
        log("1 - Converting Enfa to NFA", automaton);
        automaton = noam_js_1.noam.fsm.convertEnfaToNfa(automaton);
        log("2 - Converting NFA to DFA", automaton);
        automaton = noam_js_1.noam.fsm.convertNfaToDfa(automaton);
        log("3 - Converting state to numbers ", automaton);
        let numToList = (elt) => typeof elt == 'number' ? [elt] : elt;
        try {
            let statesToNumbers = HisAutomaton2Mine(noam_js_1.noam.fsm.convertStatesToNumbers(automaton));
            log("4 - Minimizing automaton ", statesToNumbers);
            let minimized = statesToNumbers.minimize();
            log("5 - Minimization OK, ", minimized);
            return minimized;
        }
        catch {
            throw 'Error';
        }
    }
    exports.minimizeAutomaton = minimizeAutomaton;
    function intersectionAutomata(a1, a2) {
        (0, Utilities_js_2.myLog)({ a: ["Intersection, ", a1.states.size, a2.states.size] });
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
        return HisAutomaton2Mine(noam_js_1.noam.fsm.complement(MyAutomatonToHis(minimizeAutomaton(MyAutomatonToHis(a1)))));
    }
    exports.complementAutomata = complementAutomata;
    function differenceAutomata(a1, a2) {
        let c = complementAutomata(a2);
        return intersectionAutomata(a1, c);
    }
    exports.differenceAutomata = differenceAutomata;
});
define("teacher/Equiv", ["require", "exports", "automaton/automaton_type", "automaton/automaton_type", "automaton/automaton_type", "tools/Utilities"], function (require, exports, automaton_type_js_1, automaton_type_js_2, automaton_type_js_3, Utilities_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.equivalenceFunction = void 0;
    let equivalenceFunction = (teacher, automaton) => {
        if (teacher.counter_examples) {
            for (const counter_example of teacher.counter_examples) {
                if (teacher.member(counter_example) !=
                    (0, Utilities_js_3.boolToString)(automaton.accept_word_nfa(counter_example)))
                    return counter_example;
            }
        }
        else {
            let counterExemple = (automatonDiff) => {
                let stateList = automatonDiff.allStates;
                if (automatonDiff.acceptingStates.length == 0)
                    return undefined;
                let toExplore = Array.from(automatonDiff.initialStates);
                let explored = [];
                let parent = new Array(stateList.length).fill({ parent: undefined, symbol: "" });
                while (toExplore.length > 0) {
                    const current = toExplore.shift();
                    if (explored.includes(current))
                        continue;
                    explored.push(current);
                    for (const [symbol, states] of current.outTransitions) {
                        if (!explored.includes(states[0])) {
                            parent[stateList.indexOf(states[0])] =
                                { parent: current, symbol: symbol };
                            if (!toExplore.includes(states[0]))
                                toExplore.push(states[0]);
                        }
                    }
                    if (automatonDiff.acceptingStates.includes(current)) {
                        let id = stateList.indexOf(current);
                        let res = [parent[id].symbol];
                        while (parent[id].parent) {
                            id = stateList.indexOf(parent[id].parent);
                            res.push(parent[id].symbol);
                        }
                        return res.reverse().join("");
                    }
                }
                return "";
            };
            let automMinimized = (0, automaton_type_js_3.minimizeAutomaton)((0, automaton_type_js_2.MyAutomatonToHis)(automaton));
            let diff1 = (0, automaton_type_js_1.differenceAutomata)(teacher.automaton, automMinimized);
            let counterEx1 = counterExemple(diff1);
            let diff2 = (0, automaton_type_js_1.differenceAutomata)(automMinimized, teacher.automaton);
            let counterEx2 = counterExemple(diff2);
            if (counterEx1 == undefined)
                return counterEx2;
            if (counterEx2 == undefined)
                return counterEx1;
            return counterEx1 < counterEx2 ? counterEx1 : counterEx2;
        }
    };
    exports.equivalenceFunction = equivalenceFunction;
});
define("teacher/TeacherTakingAut", ["require", "exports", "tools/Utilities", "teacher/Equiv", "automaton/automaton_type"], function (require, exports, Utilities_js_4, Equiv_js_1, automaton_type_js_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TeacherTakingAut = void 0;
    class TeacherTakingAut {
        constructor(params) {
            this.automaton = (0, automaton_type_js_4.minimizeAutomaton)((0, automaton_type_js_4.MyAutomatonToHis)(params.automaton));
            this.alphabet = params.automaton.alphabet;
            this.regex = params.regex != undefined ? params.regex : "Teacher with automaton";
            this.description = params.description != undefined ? params.description : "Teacher with automaton";
            this.counter_examples = params.counter_examples;
        }
        member(sentence) {
            return (0, Utilities_js_4.boolToString)(this.automaton.accept_word_nfa(sentence));
        }
        equiv(automaton) {
            return (0, Equiv_js_1.equivalenceFunction)(this, automaton);
        }
    }
    exports.TeacherTakingAut = TeacherTakingAut;
});
define("teacher/TeacherAutomaton", ["require", "exports", "automaton/automaton_type", "teacher/TeacherTakingAut"], function (require, exports, automaton_type_js_5, TeacherTakingAut_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TeacherAutomaton = void 0;
    class TeacherAutomaton extends TeacherTakingAut_js_1.TeacherTakingAut {
        constructor(regex, description) {
            super({ automaton: (0, automaton_type_js_5.regexToAutomaton)(regex), description: description, regex: regex });
            this.description = description || `Automaton accepting L = regex(${regex})`;
        }
    }
    exports.TeacherAutomaton = TeacherAutomaton;
});
define("teacher/TeacherNoAutomaton", ["require", "exports", "tools/Utilities", "teacher/Equiv"], function (require, exports, Utilities_js_5, Equiv_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TeacherNoAutomaton = void 0;
    class TeacherNoAutomaton {
        constructor(params, description) {
            this.max_word_length = 8;
            this.counter = 0;
            this.description = description || ((typeof params.regex == 'string') ? "Automaton with regex : " + params.regex :
                `Teacher with function<br><pre> ${js_beautify(params.regex.toString())}</pre>`);
            this.alphabet = Array.from(params.alphabet);
            this.regex = (typeof params.regex == 'string') ? params.regex : "Teacher with function";
            this.check_function =
                (typeof params.regex == 'string') ?
                    s => s.match(new RegExp(`^(${params.regex})$`)) != undefined :
                    params.regex;
            this.counter_examples = params.counter_examples;
        }
        member(sentence) {
            return (0, Utilities_js_5.boolToString)(this.check_function(sentence));
        }
        equiv(automaton) {
            return (0, Equiv_js_2.equivalenceFunction)(this, automaton);
        }
    }
    exports.TeacherNoAutomaton = TeacherNoAutomaton;
    TeacherNoAutomaton.counter = 0;
});
define("teacher/Teacher", ["require", "exports", "automaton/Automaton", "teacher/TeacherAutomaton", "teacher/TeacherNoAutomaton", "tools/Utilities", "teacher/TeacherTakingAut"], function (require, exports, Automaton_js_2, TeacherAutomaton_js_1, TeacherNoAutomaton_js_1, Utilities_js_6, TeacherTakingAut_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.teachers = exports.binaryAddition = exports.teacher_b_bStar_a__b_aOrb_star = exports.teacher_bStar_a_or_aStart_bStar = exports.teacherNotAfourthPos = exports.teacherEvenAandThreeB = exports.teacherA3fromLast = exports.teacherPairZeroAndOne = exports.teacher_a_or_baStar = void 0;
    exports.teacher_a_or_baStar = new TeacherAutomaton_js_1.TeacherAutomaton("a+(ba)*");
    exports.teacherPairZeroAndOne = new TeacherAutomaton_js_1.TeacherAutomaton("(00+11+(01+10)(00+11)*(01+10))*", `Automaton accepting L = {w in (0, 1)* | #(w_0) % 2 = 0 and #(w_1) % 2 = 0} <br/> → words with even nb of '0' and even nb of '1'`);
    exports.teacherA3fromLast = new TeacherAutomaton_js_1.TeacherAutomaton("(a+b)*a(a+b)(a+b)", `Automaton accepting L = {w in (a, b)* | w[-3] = a} <br/>
    → words with an 'a' in the 3rd pos from end`);
    exports.teacherEvenAandThreeB = new TeacherAutomaton_js_1.TeacherAutomaton("b*a(b+ab*a)*+(a+b)*ba*ba*b(a+b)*", `Automaton accepting L = {w in (a, b)* | #(w_b) ≥ 3 or #(w_a) % 2 = 1}
  <br/> → words with at least 3 'b' or an odd nb of 'a'`);
    exports.teacherNotAfourthPos = new TeacherAutomaton_js_1.TeacherAutomaton("((a+b)(a+b)(a+b)b)*(a+b+$)(a+b+$)(a+b+$)", `Automaton accepting L = {w ∈ (a,b)* and i ∈ 4ℕ | w[i] ≠ a and i ≤ len(w)} <br/>
  → words without an 'a' in a position multiple of 4`);
    exports.teacher_bStar_a_or_aStart_bStar = new TeacherNoAutomaton_js_1.TeacherNoAutomaton({ alphabet: "ab", regex: "((bb*a)|(a*b*))", counter_examples: ["bba", "b", "aabb", "aba", "aa", "bbaa"] }, `Automaton accepting L = regex((bb^*a) + (a^*b^*))`);
    exports.teacher_b_bStar_a__b_aOrb_star = new TeacherAutomaton_js_1.TeacherAutomaton("bb*($+a(b(a+b))*)");
    exports.binaryAddition = new TeacherNoAutomaton_js_1.TeacherNoAutomaton({
        alphabet: "012345678",
        regex: sentence => {
            let charToBin = (char) => (parseInt(char) >>> 0).toString(2).padStart(3, "0");
            let sentenceAr = Array.from(sentence).map(e => charToBin(e));
            let fst_term = parseInt(sentenceAr.map(e => e[0]).join(''), 2);
            let snd_term = parseInt(sentenceAr.map(e => e[1]).join(''), 2);
            let trd_term = parseInt(sentenceAr.map(e => e[2]).join(''), 2);
            return fst_term + snd_term == trd_term;
        },
        counter_examples: (0, Utilities_js_6.allStringFromAlphabet)({ alphabet: '012345678', maxLength: 3 })
    }, `  <pre>
       /**
       *  Automaton calculating addition between binary integers: 
       * exemple : 
       * 0101 + 
       * 1001 =
       * 1110
       * is a valid exemple that can be sent to the automaton with the encoding 3516
       * 3 = 011 (the 1st col), 5 = 101 (the 2nd col), 
       * 1 = 001 (the 3rd col), 6 = 110 (the 4th col) 
       **/</pre> `);
    let t1 = new TeacherTakingAut_js_2.TeacherTakingAut({
        automaton: Automaton_js_2.Automaton.strToAutomaton(`
[0]
a1,[14]->[9]
a1,[14]->[7]
a0,[13]->[8]
a0,[12]->[8]
a0,[12]->[5]
a1,[12]->[0]
a0,[11]->[14]
a0,[11]->[9]
a1,[11]->[3]
a0,[10]->[9]
a0,[10]->[7]
a1,[10]->[8]
a1,[10]->[5]
a0,[9]->[5]
a1,[9]->[6]
a1,[8]->[13]
a1,[8]->[9]
a0,[7]->[13]
a1,[7]->[12]
a1,[7]->[10]
a1,[7]->[2]
a1,[7]->[1]
a0,[6]->[7]
a0,[6]->[1]
a0,[5]->[13]
a0,[5]->[2]
a0,[5]->[0]
a0,[4]->[14]
a0,[4]->[11]
a1,[4]->[7]
a0,[3]->[11]
a0,[3]->[8]
a1,[3]->[10]
a1,[3]->[2]
a1,[2]->[7]
a1,[2]->[6]
a1,[2]->[2]
a0,[1]->[9]
a0,[1]->[0]
a1,[1]->[4]
a0,[0]->[10]
a0,[0]->[4]
a0,[0]->[0]
a1,[0]->[14]
a1,[0]->[9]
a1,[0]->[8]
[10]
[7]
[0]

`)
    });
    exports.teachers = [t1, exports.teacher_a_or_baStar, exports.teacher_b_bStar_a__b_aOrb_star, exports.binaryAddition, exports.teacherA3fromLast, exports.teacherEvenAandThreeB, exports.teacherNotAfourthPos, exports.teacherPairZeroAndOne, exports.teacher_bStar_a_or_aStart_bStar];
});
define("learners/LearnerBase", ["require", "exports", "tools/Utilities"], function (require, exports, Utilities_js_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LearnerBase = void 0;
    class LearnerBase {
        constructor(teacher) {
            this.finish = false;
            this.alphabet = Array.from(teacher.alphabet);
            this.teacher = teacher;
            this.member_number = 0;
            this.equiv_number = 0;
            this.closedness_counter = 0;
            this.consistence_counter = 0;
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
            let prefix_list = (0, Utilities_js_7.generate_prefix_list)(new_elt);
            for (const prefix of prefix_list) {
                if (this.S.includes(prefix))
                    return;
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
            return;
        }
        add_elt_in_E(new_elt, after_equiv = false) {
            let suffix_list = (0, Utilities_js_7.generate_suffix_list)(new_elt);
            for (const suffix of suffix_list) {
                if (this.E.includes(suffix))
                    break;
                this.SA.forEach(s => {
                    if (s + suffix == new_elt && after_equiv)
                        this.update_observation_table(s, (0, Utilities_js_7.boolToString)(!this.automaton.accept_word(new_elt)));
                    else
                        this.make_member(s, suffix);
                });
                this.S.forEach(s => {
                    if (s + suffix == new_elt && after_equiv)
                        this.update_observation_table(s, (0, Utilities_js_7.boolToString)(!this.automaton.accept_word(new_elt)));
                    else
                        this.make_member(s, suffix);
                });
                this.E.push(suffix);
            }
        }
        add_row(row_name, after_member = false) {
            this.E.forEach(e => {
                if (after_member && e == "")
                    this.observation_table[row_name] = (0, Utilities_js_7.boolToString)(!this.automaton.accept_word_nfa(row_name));
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
                this.add_elt_in_E(new_col);
            }
            else {
                let automaton = this.make_automaton();
                this.automaton = automaton;
                let answer = this.make_equiv(automaton);
                if (answer != undefined) {
                    this.table_to_update_after_equiv(answer, false);
                    this.automaton = undefined;
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
        get_member_number() {
            return this.member_number;
        }
        get_equiv_number() {
            return this.equiv_number;
        }
        get_consistente_counter() {
            return this.consistence_counter;
        }
        get_closedness_counter() {
            return this.closedness_counter;
        }
        get_state_number() {
            return this.automaton.state_number();
        }
        get_transition_number() {
            return this.automaton.transition_number();
        }
        same_row(a, b) {
            return this.observation_table[a] == this.observation_table[b];
        }
    }
    exports.LearnerBase = LearnerBase;
});
define("learners/L_star", ["require", "exports", "automaton/Automaton", "learners/LearnerBase"], function (require, exports, Automaton_js_3, LearnerBase_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.L_star = void 0;
    class L_star extends LearnerBase_js_1.LearnerBase {
        constructor(teacher) {
            super(teacher);
        }
        make_automaton() {
            let wordForState = [], statesMap = new Map(), acceptingStates = [], initialStates = [], statesSet = new Set();
            this.S.forEach(s => {
                let name = this.observation_table[s];
                if (!statesMap.get(name)) {
                    let state = new Automaton_js_3.State(name, name[0] == "1", s == "", this.alphabet);
                    wordForState.push(s);
                    if (state.isAccepting)
                        acceptingStates.push(state);
                    if (state.isInitial)
                        initialStates.push(state);
                    statesMap.set(name, state);
                    statesSet.add(state);
                }
            });
            for (const word of wordForState) {
                let name = this.observation_table[word];
                for (const symbol of this.alphabet) {
                    statesMap.get(name).outTransitions.get(symbol).push(statesMap.get(this.observation_table[word + symbol]));
                }
            }
            this.automaton = new Automaton_js_3.Automaton(statesSet);
            return this.automaton;
        }
        is_close() {
            let res = this.SA.find(t => !this.S.some(s => this.same_row(s, t)));
            this.closedness_counter += res == undefined ? 0 : 1;
            return res;
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
                                    this.observation_table[s2 + a][i] && !this.E.includes(a + this.E[i])) {
                                    this.consistence_counter++;
                                    return [s1, s2, a + this.E[i]];
                                }
                            }
                        }
                    }
                }
            }
        }
        table_to_update_after_equiv(answer) {
            this.add_elt_in_S(answer, true);
        }
    }
    exports.L_star = L_star;
});
define("html_interactions/HTML_LearnerBase", ["require", "exports", "Main", "tools/Utilities"], function (require, exports, Main_js_1, Utilities_js_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTML_LearnerBase = void 0;
    class HTML_LearnerBase {
        constructor(learner) {
            this.table_counter = 0;
            this.stopNextStep = false;
            this.learner = learner;
            this.pile_actions = [() => this.draw_table()];
            this.tableHTML = document.createElement('table');
            this.table_header = this.tableHTML.createTHead();
            this.table_body = this.tableHTML.createTBody();
        }
        draw_table() {
            document.getElementById('tableHead')?.classList.remove('up');
            this.add_row_html(this.table_header, "Table" + this.table_counter++, undefined, this.learner.E, 2);
            var fst = "S";
            for (var s of this.learner.S) {
                const row = Array.from(this.learner.observation_table[s]);
                this.add_row_html(this.table_body, fst, s, row, 1, fst ? this.learner.S.length : 1);
                fst = undefined;
            }
            var fst = "SA";
            for (var s of this.learner.SA) {
                const row = Array.from(this.learner.observation_table[s]);
                this.add_row_html(this.table_body, fst, s, row, 1, fst ? this.learner.SA.length : 1);
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
                row.classList.add('borderTopTable');
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
        async next_step() {
            if (this.stopNextStep || ((this.automaton && !this.automaton.continueAction)))
                return;
            document.getElementById('centerDiv').replaceWith((0, Main_js_1.centerDivClone)());
            document.getElementById('tableHead')?.classList.remove('up');
            if (this.pile_actions.length > 0)
                await this.pile_actions.shift()();
            else if (!this.close_action()) { }
            else if (!this.consistence_action()) { }
            else
                this.send_automaton_action();
            this.message().innerHTML =
                `Membership queries = ${this.learner.member_number} - Equivalence queries = ${this.learner.equiv_number}` + (this.learner.automaton ? ` - States = ${this.learner.automaton?.state_number()} - Transitions = ${this.learner.automaton?.transition_number()}` : ``) + `<br> ${this.message().innerHTML}`;
            if (this.learner.finish) {
                this.message().innerHTML += "The Teacher has accepted the automaton";
                this.stopNextStep = true;
            }
            document.getElementById('messageHead')?.classList.remove('up');
            document.getElementById('tableHead')?.classList.remove('up');
            document.getElementById('teacher_description')?.classList.remove('up');
            document.getElementById('table').innerHTML = this.tableHTML.innerHTML;
            document.getElementById('teacher_description').innerHTML = this.learner.teacher.description;
            const timer = (ms) => new Promise(res => setTimeout(res, ms));
            if (this.automaton && !this.automaton.continueAction)
                while (this.automaton && !this.automaton.continueAction) {
                    let tm = timer(5);
                    await tm.then(() => { if (this.automaton.continueAction)
                        (0, Main_js_1.addHistoryElement)(this.automaton); }).catch(e => {
                        (0, Utilities_js_8.myLog)({ a: [e] });
                    });
                }
            else {
                (0, Main_js_1.addHistoryElement)(this.automaton);
            }
        }
        close_action() {
            const close_rep = this.learner.is_close();
            if (close_rep != undefined) {
                this.message().innerText =
                    this.close_message(close_rep);
                this.pile_actions.push(() => {
                    this.message().innerText = "";
                    this.learner.add_elt_in_S(close_rep);
                    this.clear_table();
                    this.draw_table();
                });
                return false;
            }
            return true;
        }
        consistence_action() {
            const consistence_rep = this.learner.is_consistent();
            if (consistence_rep != undefined) {
                let s1 = consistence_rep[0];
                let s2 = consistence_rep[1];
                let new_col = consistence_rep[2];
                this.message().innerText = this.consistent_message(s1, s2, new_col);
                this.pile_actions.push(() => {
                    this.message().innerText = "";
                    this.learner.add_elt_in_E(new_col);
                    this.clear_table();
                    this.draw_table();
                });
                return false;
            }
            return true;
        }
        send_automaton_action() {
            this.message().innerText =
                `The table is consistent and closed, I will send an automaton`;
            let automaton = this.learner.make_automaton();
            this.automaton = automaton;
            window.automaton = automaton;
            this.pile_actions.push(async () => {
                this.message().innerHTML = "";
                automaton.initiate_graph();
                $('#input-automaton')[0].classList.remove('hide');
                function delay(ms) {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }
                while (!automaton.continueAction) {
                    await delay(10).then(async () => {
                        document.getElementById("messageHead").scrollIntoView();
                        if (!automaton.continueAction)
                            return;
                        await delay(10).then(() => {
                            let answer = this.learner.make_equiv(automaton);
                            (0, Utilities_js_8.myLog)({ a: [answer] });
                            if (answer != undefined) {
                                this.message().innerText =
                                    `The sent automaton is not valid, here is a counter-exemple ${answer}`;
                                this.pile_actions.push(() => {
                                    this.message().innerHTML = "";
                                    (0, Main_js_1.clear_automaton_HTML)();
                                    this.learner.table_to_update_after_equiv(answer, true);
                                    this.clear_table();
                                    this.draw_table();
                                });
                                return;
                            }
                            this.learner.finish = true;
                            $("#next_step")[0].classList.add('hide');
                            $("#go_to_end")[0].classList.add('hide');
                        });
                    });
                }
            });
        }
        async go_to_end() {
            while (!this.learner.finish) {
                await this.next_step();
            }
        }
        message() {
            return document.getElementById('message');
        }
    }
    exports.HTML_LearnerBase = HTML_LearnerBase;
});
define("html_interactions/HTML_L_star", ["require", "exports", "learners/L_star", "html_interactions/HTML_LearnerBase"], function (require, exports, L_star_js_1, HTML_LearnerBase_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTML_L_star = void 0;
    class HTML_L_star extends HTML_LearnerBase_js_1.HTML_LearnerBase {
        constructor(teacher) {
            super(new L_star_js_1.L_star(teacher));
        }
        close_message(close_rep) {
            let row = this.learner.observation_table[close_rep];
            return `The table is not closed since there is row(${close_rep}) = "${row}" where "${close_rep}" is in SA and "${row}" is not present in S. 
    "${close_rep}" will be moved from SA to S.`;
        }
        consistent_message(s1, s2, new_col) {
            let fstChar = new_col[0], sndChar = new_col.length == 1 ? "ε" : new_col.substring(1);
            return `The table is not consistent since :
        row(${s1 ? s1 : "ε"}) = row(${s2 ? s2 : "ε"}) where ${s1 ? s1 : "ε"}, ${s2 ? s2 : "ε"} ∈ S but row(${s1 + new_col[0]}) ≠ row(${s2 + new_col[0]});
        The column "${new_col}" will be added in E since T(${s1 + new_col}) ≠ T(${s2 + new_col}) 
        [Note : ${new_col} = ${fstChar} ∘ ${sndChar} and ${fstChar} ∈ Σ and ${sndChar} ∈ E]`;
        }
    }
    exports.HTML_L_star = HTML_L_star;
});
define("learners/NL_star", ["require", "exports", "automaton/Automaton", "learners/LearnerBase"], function (require, exports, Automaton_js_4, LearnerBase_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.NL_star = void 0;
    class NL_star extends LearnerBase_js_2.LearnerBase {
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
            let res = "0".repeat(row_value.length);
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
        add_elt_in_S(new_elt, after_equiv = false) {
            super.add_elt_in_S(new_elt, after_equiv);
            this.check_prime_lines();
            return;
        }
        add_elt_in_E(new_elt, after_equiv = false) {
            super.add_elt_in_E(new_elt, after_equiv);
            this.check_prime_lines();
            return;
        }
        is_close() {
            let res = this.SA.find(t => !this.S.some(s => this.same_row(s, t)) && this.prime_lines.includes(t));
            this.closedness_counter += res == undefined ? 0 : 1;
            return res;
        }
        is_consistent() {
            let testCovering = (s1, s2) => {
                let value_s1 = this.observation_table[s1];
                let value_s2 = this.observation_table[s2];
                if (this.is_covered(value_s1, value_s2)) {
                    for (const a of this.alphabet) {
                        let value_s1_p = this.observation_table[s1 + a];
                        let value_s2_p = this.observation_table[s2 + a];
                        if (!this.is_covered(value_s1_p, value_s2_p)) {
                            for (let i = 0; i < this.E.length; i++) {
                                if (this.observation_table[s1 + a][i] >
                                    this.observation_table[s2 + a][i] && !this.E.includes(a + this.E[i])) {
                                    this.consistence_counter++;
                                    return [s1, s2, a + this.E[i]];
                                }
                            }
                        }
                    }
                    return;
                }
            };
            for (let s1_ind = 0; s1_ind < this.S.length; s1_ind++) {
                for (let s2_ind = s1_ind + 1; s2_ind < this.S.length; s2_ind++) {
                    let s1 = this.S[s1_ind];
                    let s2 = this.S[s2_ind];
                    let test1 = testCovering(s1, s2);
                    if (test1)
                        return test1;
                    let test2 = testCovering(s2, s1);
                    if (test2)
                        return test2;
                }
            }
            return;
        }
        make_automaton() {
            let wordForState = [], statesMap = new Map(), acceptingStates = [], initialStates = [], stateSet = new Set();
            this.prime_lines.forEach(s => {
                if (this.S.includes(s)) {
                    let name = this.observation_table[s];
                    if (!statesMap.get(name)) {
                        let state = new Automaton_js_4.State(name, name[0] == "1", this.is_covered(name, this.observation_table[""]), this.alphabet);
                        wordForState.push(s);
                        if (state.isAccepting)
                            acceptingStates.push(state);
                        if (state.isInitial)
                            initialStates.push(state);
                        statesMap.set(name, state);
                        stateSet.add(state);
                    }
                }
            });
            for (const word of wordForState) {
                let name = this.observation_table[word];
                for (const symbol of this.alphabet) {
                    let rowNext = this.observation_table[word + symbol];
                    for (const [name1, state] of statesMap) {
                        if (this.is_covered(name1, rowNext))
                            statesMap.get(name).outTransitions.get(symbol).push(state);
                    }
                }
            }
            this.automaton = new Automaton_js_4.Automaton(stateSet);
            return this.automaton;
        }
        table_to_update_after_equiv(answer) {
            this.add_elt_in_S(answer, true);
        }
    }
    exports.NL_star = NL_star;
});
define("html_interactions/HTML_NL_star", ["require", "exports", "learners/NL_star", "html_interactions/HTML_LearnerBase"], function (require, exports, NL_star_js_1, HTML_LearnerBase_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.HTML_NL_star = void 0;
    class HTML_NL_star extends HTML_LearnerBase_js_2.HTML_LearnerBase {
        constructor(teacher) {
            super(new NL_star_js_1.NL_star(teacher));
        }
        add_row_html(parent, fst, head, row_elts, colspan = 1, rowspan = 1) {
            let row = super.add_row_html(parent, fst, head, row_elts, colspan, rowspan);
            if (head != undefined && this.learner.prime_lines.includes(head)) {
                row.classList.add("prime-row");
            }
            return row;
        }
        close_message(close_rep) {
            let row = this.learner.observation_table[close_rep];
            return `The table is not closed since there is row(${close_rep}) = "${row}" where "${close_rep}" is in SA and there is no row s in S such that s ⊑ ${row}.
    "${close_rep}" will be moved from SA to S.`;
        }
        consistent_message(s1, s2, new_col) {
            let fstChar = new_col[0], sndChar = new_col.length == 1 ? "ε" : new_col.substring(1);
            return `The table is not consistent since :
        row(${s1 ? s1 : "ε"}) ⊑ row(${s2 ? s2 : "ε"}) where ${s1 ? s1 : "ε"}, ${s2 ? s2 : "ε"} ∈ S but row(${s1 + new_col[0]}) ⋢ row(${s2 + new_col[0]});
        The column "${new_col}" will be added in E since T(${s1 + new_col}) ≠ T(${s2 + new_col}) 
        [Note : ${new_col} = ${fstChar} ∘ ${sndChar} and ${fstChar} ∈ Σ and ${sndChar} ∈ E]`;
        }
    }
    exports.HTML_NL_star = HTML_NL_star;
});
define("teacher/TeacherUser", ["require", "exports", "tools/Utilities"], function (require, exports, Utilities_js_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TeacherUser = void 0;
    class TeacherUser {
        constructor() {
            this.alphabet = Array.from(this.notNullPrompt("Enter your alphabet", "01", false));
            this.description = "The teacher is the User and alphabet is [" + this.alphabet.join(',') + ']';
            this.regex = "";
        }
        member(sentence) {
            return (0, Utilities_js_9.boolToString)(confirm(`Does ${sentence.length > 0 ? sentence : 'ε'} belongs to your language ?`));
        }
        equiv(_automaton) {
            let isValid = confirm(`Does the displayed automaton recognize your language ?`);
            return isValid ? undefined : this.notNullPrompt("Enter a counter-exemple");
        }
        notNullPrompt(str, defaultValue, canExit = true) {
            let alp = prompt(str, defaultValue);
            if (alp == null) {
                while (true) {
                    if (canExit) {
                        let answer = confirm("Do you want to exit teacher mode ?");
                        if (answer && canExit)
                            return "";
                        alp = prompt(str, defaultValue);
                    }
                    else {
                        alp = prompt("You can't skip this phase !\n" + str, defaultValue);
                    }
                }
            }
            return alp;
        }
    }
    exports.TeacherUser = TeacherUser;
});
define("Main", ["require", "exports", "teacher/Teacher", "html_interactions/HTML_L_star", "html_interactions/HTML_NL_star", "automaton/Automaton", "learners/L_star", "learners/NL_star", "automaton/automaton_type", "teacher/TeacherAutomaton", "teacher/TeacherUser", "tools/Utilities"], function (require, exports, Teacher_js_1, HTML_L_star_js_1, HTML_NL_star_js_1, Automaton_js_5, L_star_js_2, NL_star_js_2, autFunction, TeacherAutomaton_js_2, TeacherUser_js_1, Utilities_js_10) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.clear_automaton_HTML = exports.clear_table = exports.goBackward = exports.goForeward = exports.addHistoryElement = exports.initiate_global_vars = exports.centerDivClone = exports.backupCenterDiv = exports.historyPosition = exports.historyHTML = exports.automatonDivList = exports.automatonHTML = exports.automatonDiv = void 0;
    autFunction = __importStar(autFunction);
    exports.automatonDivList = [], exports.historyHTML = [], exports.historyPosition = 0, exports.backupCenterDiv = document.getElementById('centerDiv').cloneNode(true);
    function centerDivClone() {
        return exports.backupCenterDiv.cloneNode(true);
    }
    exports.centerDivClone = centerDivClone;
    function initiate_global_vars() {
        exports.automatonHTML = $("#automaton-mermaid")[0];
        exports.automatonDiv = $("#input-automaton")[0];
        exports.historyHTML.push([document.getElementById('centerDiv').cloneNode(true), undefined]);
        $('#leftCol span')[0].onclick = goBackward;
        $('#rightCol span')[0].onclick = goForeward;
        document.onkeydown = (key) => {
            switch (key.code) {
                case 'ArrowLeft':
                    goBackward();
                    break;
                case 'ArrowRight':
                    goForeward();
                    break;
            }
        };
        let current_automaton, teacherSelector = $("#teacher-switch")[0], algoSelector = Array.from($(".algo-switch")), mapTeacherValue = {}, counter = 0, currentTeacher = Teacher_js_1.teachers[0], newRegex = $("#input-regex")[0], newRegexSendButton = $("#button-regex")[0];
        let changeTeacherOrAlgo = () => {
            $("#next_step")[0].classList.remove('hide');
            $("#go_to_end")[0].classList.remove('hide');
            document.getElementById('centerDiv').replaceWith(centerDivClone());
            current_automaton = algoSelector[0].checked ?
                new HTML_L_star_js_1.HTML_L_star(currentTeacher) :
                new HTML_NL_star_js_1.HTML_NL_star(currentTeacher);
            $("#teacher_description")[0].innerHTML = current_automaton.learner.teacher.description;
            (0, Utilities_js_10.myLog)({ a: ["The description is ", current_automaton.learner.teacher.description] });
            clearHistory();
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
        $("#next_step")[0].addEventListener("click", () => current_automaton.next_step());
        $("#go_to_end")[0].addEventListener("click", () => current_automaton.go_to_end());
        $("#restart_algo")[0].addEventListener("click", () => changeTeacherOrAlgo());
        newRegexSendButton.addEventListener("click", () => {
            let regexAlreadyExists = Array.from($("#teacher-switch option")).find(e => e.text == newRegex.value);
            let newTeacherOption;
            if (regexAlreadyExists) {
                newTeacherOption = regexAlreadyExists;
                currentTeacher = mapTeacherValue[teacherSelector.selectedOptions[0].value];
            }
            else {
                currentTeacher = new TeacherAutomaton_js_2.TeacherAutomaton(newRegex.value, `My automaton with regex = (${newRegex.value})`);
                newTeacherOption = createRadioTeacher(currentTeacher);
            }
            newTeacherOption.selected = true;
            changeTeacherOrAlgo();
        });
        $('#radio-userTeacher')[0].onclick = () => {
            $('#teacher-switch')[0].setAttribute('disabled', '');
            currentTeacher = new TeacherUser_js_1.TeacherUser();
            changeTeacherOrAlgo();
        };
        $('#radio-pcTeacher')[0].onclick = () => {
            $('#teacher-switch')[0].removeAttribute('disabled');
            currentTeacher = mapTeacherValue[teacherSelector.selectedOptions[0].value];
            changeTeacherOrAlgo();
        };
    }
    exports.initiate_global_vars = initiate_global_vars;
    function toggleArrowLeft(toDisplay) {
        if (toDisplay)
            document.getElementById('leftCol')?.classList.remove('hide');
        else
            document.getElementById('leftCol')?.classList.add('hide');
    }
    function toggleArrowRight(toDisplay) {
        if (toDisplay)
            document.getElementById('rightCol')?.classList.remove('hide');
        else
            document.getElementById('rightCol')?.classList.add('hide');
    }
    function addHistoryElement(automaton) {
        exports.historyHTML.push([document.getElementById('centerDiv').cloneNode(true), automaton]);
        exports.historyPosition = exports.historyHTML.length - 1;
        toggleArrowRight(false);
        toggleArrowLeft(true);
    }
    exports.addHistoryElement = addHistoryElement;
    function changeMainDivContent() {
        document.getElementById('centerDiv').innerHTML = exports.historyHTML[exports.historyPosition][0].innerHTML;
        window.automaton = exports.historyHTML[exports.historyPosition][1];
    }
    function clearHistory() {
        exports.historyHTML = [];
        toggleArrowLeft(false);
        toggleArrowRight(false);
        clear_automaton_HTML();
    }
    function goForeward() {
        let lengthHistory = exports.historyHTML.length;
        if (exports.historyPosition + 1 < lengthHistory) {
            exports.historyPosition++;
            changeMainDivContent();
            toggleArrowLeft(true);
        }
        else {
            toggleArrowRight(false);
        }
    }
    exports.goForeward = goForeward;
    function goBackward() {
        if (exports.historyPosition > 0) {
            exports.historyPosition--;
            changeMainDivContent();
            toggleArrowRight(true);
        }
        else {
            toggleArrowLeft(false);
        }
    }
    exports.goBackward = goBackward;
    function clear_table() {
        document.getElementById('table').innerHTML = "";
        document.getElementById('table').innerHTML = "";
    }
    exports.clear_table = clear_table;
    function clear_automaton_HTML() {
        document.getElementsByClassName('mermaidTooltip')[0]?.remove();
        document.getElementById('automatonHead')?.classList.add('up');
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
        };
        window.Automaton = Automaton_js_5.Automaton;
        window.teachers = Teacher_js_1.teachers;
        window.L_star = L_star_js_2.L_star;
        window.NL_star = NL_star_js_2.NL_star;
        window.autFunction = autFunction;
        window.automatonDivList = exports.automatonDivList;
        window.historyHTML = exports.historyHTML;
        window.historyPosition = exports.historyPosition;
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
define("learners/Observation_table", ["require", "exports", "tools/Utilities"], function (require, exports, Utilities_js_11) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Observation_table = void 0;
    class Observation_table {
        constructor() {
            this.columns = [];
            this.rows = [];
            this.matrix = [[]];
        }
        add_column(column_name) {
            this.columns.push(column_name);
        }
        add_row(row_name) {
            this.rows.push(row_name);
        }
        set_value(row_name, column_name, bool) {
            this.matrix[this.rows.indexOf(row_name)][this.columns.indexOf(column_name)] = bool;
        }
        get_value(row_name, column_name) {
            return this.matrix[this.rows.indexOf(row_name)][this.columns.indexOf(column_name)];
        }
        get_row(row_name) {
            return this.matrix[this.rows.indexOf(row_name)];
        }
        same_row(row1, row2) {
            const r1 = this.get_row(row1);
            const r2 = this.get_row(row2);
            return r1 != undefined && r2 != undefined &&
                (0, Utilities_js_11.same_vector)(r1, r2);
        }
    }
    exports.Observation_table = Observation_table;
});
define("test_nodejs/Automaton_minimize_test", ["require", "exports", "tools/Utilities", "automaton/Automaton"], function (require, exports, Utilities_js_12, Automaton_js_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let state1 = new Automaton_js_6.State("0", false, true, ['a', 'b']);
    let state2 = new Automaton_js_6.State("1", true, false, ['a', 'b']);
    let state3 = new Automaton_js_6.State("2", true, false, ['a', 'b']);
    state1.addTransition('a', state2);
    state2.addTransition('a', state3);
    let a = new Automaton_js_6.Automaton(new Set([state1, state2, state3]));
    (0, Utilities_js_12.myLog)({ a: [a.matrix_to_mermaid()] });
    (0, Utilities_js_12.myLog)({ a: ["-".repeat(70)] });
    (0, Utilities_js_12.myLog)({ a: [a.minimize().matrix_to_mermaid()] });
    (0, Utilities_js_12.myLog)({ a: [] });
});
define("test_nodejs/PrintFunction", ["require", "exports", "learners/LearnerBase", "assert", "fs"], function (require, exports, LearnerBase_js_3, assert_1, fs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.writeToFile = exports.clearFile = exports.csvHead = exports.printCsvCompare = exports.printInfo = void 0;
    let printInfo = (algo, algoName) => {
        return `${algoName} : queries = ${algo.member_number}, equiv = ${algo.equiv_number}, states = ${algo.automaton?.state_number()}, transitions = ${algo.automaton?.transition_number()}, closedness pb = ${algo.closedness_counter}, consistence pb = ${algo.consistence_counter}`;
    };
    exports.printInfo = printInfo;
    let printCsvCompare = (L, NL) => {
        (0, assert_1.strict)(L.teacher == NL.teacher);
        let printProperty = (propery) => `${propery.call(L)},${propery.call(NL)}`;
        return `${L.teacher.regex}, ${L.teacher.alphabet.length}, ${L.teacher.description.split(",")[0]}, ${printProperty(LearnerBase_js_3.LearnerBase.prototype.get_member_number)}, ${printProperty(LearnerBase_js_3.LearnerBase.prototype.get_equiv_number)}, ${printProperty(LearnerBase_js_3.LearnerBase.prototype.get_state_number)}, ${printProperty(LearnerBase_js_3.LearnerBase.prototype.get_transition_number)}, ${printProperty(LearnerBase_js_3.LearnerBase.prototype.get_closedness_counter)}, ${printProperty(LearnerBase_js_3.LearnerBase.prototype.get_consistente_counter)}`;
    };
    exports.printCsvCompare = printCsvCompare;
    exports.csvHead = "Regex,Length alphabet,Description,L Membership queries,NL Membership queries,L Equivalence queries,NL Equivalence queries,L State nb in A,NL State nb in A,L Transition nb in A,NL Transition nb in A,L Closedness,NL Closedness,L Consistence,NL Consistence";
    let fileNameToCsv = (fileName) => "./statistics/" + fileName + ".csv";
    let clearFile = (fileName) => (0, fs_1.writeFileSync)(fileNameToCsv(fileName), "");
    exports.clearFile = clearFile;
    let writeToFile = (fileName, content) => {
        (0, fs_1.appendFileSync)(fileNameToCsv(fileName), content + "\n");
    };
    exports.writeToFile = writeToFile;
});
define("test_nodejs/CompareBenchMark", ["require", "exports", "fs", "test_nodejs/PrintFunction", "teacher/TeacherTakingAut", "learners/L_star", "learners/NL_star", "automaton/Automaton", "tools/Utilities"], function (require, exports, fs_2, PrintFunction_js_1, TeacherTakingAut_js_3, L_star_js_3, NL_star_js_3, Automaton_js_7, Utilities_js_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let benchMark = true;
    let path = ("./statistics/" + (benchMark ? "benchMark/" : "automata/")), fileName = benchMark ? "benchMark" : "randomAutomata", files = (0, fs_2.readdirSync)(path), automata = [], minStateNb = 0, maxStateNb = 63, toWrite = false;
    for (const underFolder of files) {
        (0, Utilities_js_13.myLog)({ a: [underFolder] });
        if (!underFolder.startsWith("1.5"))
            continue;
        let newPath = path + underFolder + "/";
        let files = (0, fs_2.readdirSync)(newPath);
        for (const file of files) {
            if (!file.endsWith('.ba'))
                continue;
            (0, Utilities_js_13.myLog)({ a: ["=".repeat(90)] });
            console.error("Creating automaton of file", underFolder + "/" + file);
            (0, Utilities_js_13.myLog)({ a: ["Creating automaton of file", underFolder + "/" + file] });
            let content = (0, fs_2.readFileSync)(newPath + file).toString();
            let automaton = Automaton_js_7.Automaton.strToAutomaton(content);
            let teacher = new TeacherTakingAut_js_3.TeacherTakingAut({ automaton: automaton, regex: underFolder + "/" + file });
            (0, Utilities_js_13.myLog)({ a: ["State number is", "-".repeat(50), teacher.automaton.state_number()] });
            if (teacher.automaton.state_number() > minStateNb
                && teacher.automaton.state_number() < maxStateNb) {
                automata.push([teacher, underFolder + "/" + file]);
                teacher.description = teacher.automaton.state_number() + "";
            }
        }
    }
    (0, Utilities_js_13.myLog)({ a: [automata.map(e => e[1])] });
    (0, Utilities_js_13.myLog)({ a: ["=".repeat(90)] });
    (0, Utilities_js_13.myLog)({ a: ["Automata created the ordered list of states is :"] });
    automata.sort((a, b) => a[0].automaton.state_number() - b[0].automaton.state_number());
    automata.forEach(a => (0, Utilities_js_13.myLog)({ a: [a[0].automaton.state_number()] }));
    if (toWrite) {
        (0, PrintFunction_js_1.clearFile)(fileName);
        (0, PrintFunction_js_1.writeToFile)(fileName, PrintFunction_js_1.csvHead);
    }
    for (let index = 0; index < automata.length; index++) {
        const [teacher, file] = automata[index];
        let L = new L_star_js_3.L_star(teacher), NL = new NL_star_js_3.NL_star(teacher);
        (0, Utilities_js_13.myLog)({ a: ["=".repeat(90)] });
        console.error(file, "Current benchmark :", index, "/", automata.length, "With state number", teacher.automaton.state_number());
        (0, Utilities_js_13.myLog)({ a: [file, "Current benchmark :", index, "/", automata.length, "With state number", teacher.automaton.state_number()], toLog: true });
        L.make_all_queries();
        console.error("In L*");
        (0, Utilities_js_13.myLog)({ a: [(0, PrintFunction_js_1.printInfo)(L, "L*")], toLog: true });
        NL.make_all_queries();
        (0, Utilities_js_13.myLog)({ a: ["-".repeat(80)] });
        console.error("In NL*");
        (0, Utilities_js_13.myLog)({ a: [(0, PrintFunction_js_1.printInfo)(NL, "NL*")], toLog: true });
        if (L.consistence_counter > 1 && L.closedness_counter > 1 &&
            NL.consistence_counter > 1 && NL.closedness_counter > 1 &&
            L.equiv_number > NL.equiv_number && NL.equiv_number > 0) {
            (0, Utilities_js_13.myLog)({ a: [(0, PrintFunction_js_1.printInfo)(L, "L*")], toLog: true });
            (0, Utilities_js_13.myLog)({ a: [(0, PrintFunction_js_1.printInfo)(NL, "NL*")], toLog: true });
            (0, Utilities_js_13.myLog)({ a: [(0, PrintFunction_js_1.printCsvCompare)(L, NL)], toLog: true });
            break;
        }
        if (toWrite)
            (0, PrintFunction_js_1.writeToFile)(fileName, (0, PrintFunction_js_1.printCsvCompare)(L, NL));
    }
});
define("test_nodejs/GenerateAutomaton", ["require", "exports", "fs", "automaton/Automaton", "tools/Utilities"], function (require, exports, fs_3, Automaton_js_8, Utilities_js_14) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let path = "./statistics/automata/", iterationNumber = 5000, minStateNumber = 10, maxStateNumber = 350, maxFilePerFolder = 40, maxAutomatonStates = 200, folders = new Set(new Array(maxAutomatonStates).fill(1).map((_, pos) => pos + 1));
    const randInt = (max) => {
        let res = Math.floor(Math.random() * max);
        return res;
    };
    const reachableFromState = (s) => {
        let l = new Set();
        let toExplore = [s];
        while (toExplore.length > 0) {
            let shift = toExplore.pop();
            let neigh = new Set(s.alphabet.map(e => shift.getSuccessor(e)).flat());
            for (const state of neigh) {
                if (!l.has(state)) {
                    l.add(state);
                    toExplore.push(state);
                }
            }
        }
        return Array.from(l);
    };
    for (let stateNumber = minStateNumber; stateNumber < maxStateNumber; stateNumber += 10) {
        if (folders.size == 0)
            break;
        (0, Utilities_js_14.myLog)({ a: ["Iteration =", stateNumber, "Folder to fill :", folders.size] });
        for (let counter = 0; counter < iterationNumber; counter++) {
            if (folders.size == 0)
                break;
            const states = [];
            for (let i = 0; i < stateNumber; i++) {
                states.push(new Automaton_js_8.State(i + '', false, false, 'ab'));
            }
            for (const state of states) {
                state.addTransition('a', states[randInt(stateNumber)]);
                state.addTransition('b', states[randInt(stateNumber)]);
            }
            let newInitial = states[randInt(stateNumber)];
            newInitial.isInitial = true;
            let reachable = reachableFromState(newInitial);
            for (let i = 0; i < randInt(reachable.length); i++) {
                reachable[randInt(reachable.length)].isAccepting = true;
            }
            let automaton = new Automaton_js_8.Automaton(states), minimized = automaton.minimize(), folderName = minimized.state_number();
            if (folderName > maxAutomatonStates)
                continue;
            if (!(0, fs_3.existsSync)(path + folderName))
                (0, fs_3.mkdirSync)(path + folderName);
            let dirElementNb = (0, fs_3.readdirSync)(path + folderName).length;
            if (dirElementNb > maxFilePerFolder) {
                folders.delete(folderName);
                continue;
            }
            (0, fs_3.writeFileSync)(path + folderName + "/" + dirElementNb + ".ba", minimized.toString());
            (0, Utilities_js_14.myLog)({ a: ["State Number =", stateNumber, "Counter =", counter, "StateNb =", folderName] });
        }
    }
});
define("test_nodejs/LearnerCompare", ["require", "exports", "learners/NL_star", "learners/L_star", "teacher/Teacher", "test_nodejs/PrintFunction", "teacher/TeacherTakingAut", "fs", "automaton/Automaton"], function (require, exports, NL_star_js_4, L_star_js_4, Teacher_js_2, PrintFunction_js_2, TeacherTakingAut_js_4, fs_4, Automaton_js_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let fileName = "randomRegex", writeToFileB = false, teachers1 = [...Teacher_js_2.teachers, new TeacherTakingAut_js_4.TeacherTakingAut({ automaton: Automaton_js_9.Automaton.strToAutomaton((0, fs_4.readFileSync)('./statistics/benchMark/2-0.1/A6.ba').toString()), regex: '2-0.1/A6.ba' })];
    if (writeToFileB) {
        (0, PrintFunction_js_2.clearFile)(fileName);
        (0, PrintFunction_js_2.writeToFile)(fileName, PrintFunction_js_2.csvHead);
    }
    for (let index = 0; index < teachers1.length; index++) {
        const teacher = teachers1[index];
        teacher.description = index + "";
        let L = new L_star_js_4.L_star(teacher);
        let NL = new NL_star_js_4.NL_star(teacher);
        console.log("==============================");
        console.log("Current regexp : ", teacher.regex, teacher.description);
        L.make_all_queries();
        console.log((0, PrintFunction_js_2.printInfo)(L, "L*"));
        NL.make_all_queries();
        console.log((0, PrintFunction_js_2.printInfo)(NL, "NL*"));
        if (writeToFileB)
            (0, PrintFunction_js_2.writeToFile)(fileName, (0, PrintFunction_js_2.printCsvCompare)(L, NL));
    }
});
define("test_nodejs/Test_wrost_DFA", ["require", "exports", "test_nodejs/PrintFunction", "learners/L_star", "learners/NL_star", "teacher/TeacherNoAutomaton", "tools/Utilities"], function (require, exports, PrintFunction_js_3, L_star_js_5, NL_star_js_5, TeacherNoAutomaton_js_2, Utilities_js_15) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let toWrite = true;
    let fileName = "wrostDFA";
    if (toWrite) {
        (0, PrintFunction_js_3.clearFile)(fileName);
        (0, PrintFunction_js_3.writeToFile)(fileName, PrintFunction_js_3.csvHead);
    }
    let regexList = [];
    const minN = 0, maxN = 10;
    for (let i = minN; i < maxN; i++) {
        let counter_examples = [];
        for (let j = Math.max(0, i - 3); j <= i + 3; j++) {
            counter_examples.push("a".repeat(j));
            counter_examples.push("a".repeat(j) + "b");
            counter_examples.push("a".repeat(j) + "b" + "a".repeat(i));
            counter_examples.push("a".repeat(j) + "b" + "b".repeat(i));
            counter_examples.push("a".repeat(j) + "a" + "b".repeat(i));
        }
        counter_examples.push("bbbbbbbbbbbbbbbabbbbbab");
        regexList.push(["(a+b)*a" + "(a+b)".repeat(i), counter_examples]);
    }
    let printInfo = (algo, algoName) => {
        return `${algoName} : queries = ${algo.member_number}, equiv = ${algo.equiv_number}, states = ${algo.automaton?.state_number()}, transitions = ${algo.automaton?.transition_number()}`;
    };
    for (let index = 0; index < regexList.length; index++) {
        const [regex, counter_examples] = regexList[index];
        let teacher1 = new TeacherNoAutomaton_js_2.TeacherNoAutomaton({
            alphabet: "ab",
            regex: regex.replace(/\+/g, "|"),
            counter_examples: counter_examples,
        }, (minN + index) + "");
        let teacher = teacher1;
        let L = new L_star_js_5.L_star(teacher);
        let NL = new NL_star_js_5.NL_star(teacher);
        (0, Utilities_js_15.myLog)({ a: ["=============================="] });
        (0, Utilities_js_15.myLog)({ a: ["Current regexp : ", regex] });
        (0, Utilities_js_15.myLog)({ a: ["In L*"] });
        L.make_all_queries();
        (0, Utilities_js_15.myLog)({ a: [printInfo(L, "L*")] });
        (0, Utilities_js_15.myLog)({ a: ["In NL*"] });
        NL.make_all_queries();
        (0, Utilities_js_15.myLog)({ a: [printInfo(NL, "NL*")] });
        if (toWrite)
            (0, PrintFunction_js_3.writeToFile)(fileName, (0, PrintFunction_js_3.printCsvCompare)(L, NL));
    }
});
define("test_nodejs/Test_wrost_RFSA", ["require", "exports", "test_nodejs/PrintFunction", "learners/L_star", "learners/NL_star", "teacher/TeacherTakingAut", "automaton/Automaton", "automaton/automaton_type", "tools/Utilities"], function (require, exports, PrintFunction_js_4, L_star_js_6, NL_star_js_6, TeacherTakingAut_js_5, Automaton_js_10, automaton_type_js_6, Utilities_js_16) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let toWrite = true;
    let fileName = "wrostRFSA";
    if (toWrite) {
        (0, PrintFunction_js_4.clearFile)(fileName);
        (0, PrintFunction_js_4.writeToFile)(fileName, PrintFunction_js_4.csvHead);
    }
    let automatonList = [];
    let counter_examples = (0, Utilities_js_16.allStringFromAlphabet)({ alphabet: "ab", maxLength: 14 });
    const N = 2, maxN = 11;
    for (let n = N; n < maxN; n++) {
        (0, Utilities_js_16.myLog)({ a: ["Creating test with", n, "power"] });
        let states = new Array(n).fill(0).map((_, i) => new Automaton_js_10.State(i + "", i == 0, i < n / 2, ['a', 'b']));
        for (let i = 0; i < n - 1; i++)
            states[i].addTransition('a', states[i + 1]);
        states[n - 1].addTransition('a', states[0]);
        states[0].addTransition('b', states[0]);
        for (let i = 2; i < n; i++)
            states[i].addTransition('b', states[i - 1]);
        states[1].addTransition('b', states[n - 1]);
        automatonList.push((0, automaton_type_js_6.minimizeAutomaton)((0, automaton_type_js_6.MyAutomatonToHis)(new Automaton_js_10.Automaton(new Set(states)))));
    }
    let printInfo = (algo, algoName) => {
        return `${algoName} : queries = ${algo.member_number}, equiv = ${algo.equiv_number}, states = ${algo.automaton?.state_number()}, transitions = ${algo.automaton?.transition_number()}`;
    };
    for (let i = 0; i < automatonList.length; i++) {
        let automaton = automatonList[i];
        let teacher = new TeacherTakingAut_js_5.TeacherTakingAut({
            automaton: automaton,
            description: (N + i) + "",
            counter_examples: counter_examples
        });
        let L = new L_star_js_6.L_star(teacher);
        let NL = new NL_star_js_6.NL_star(teacher);
        (0, Utilities_js_16.myLog)({ a: ["=".repeat(100)] });
        (0, Utilities_js_16.myLog)({ a: ["Current n : ", N + i] });
        (0, Utilities_js_16.myLog)({ a: ["In L*"] });
        L.make_all_queries();
        (0, Utilities_js_16.myLog)({ a: [printInfo(L, "L*")] });
        (0, Utilities_js_16.myLog)({ a: ["In NL*"] });
        NL.make_all_queries();
        (0, Utilities_js_16.myLog)({ a: [printInfo(NL, "NL*")] });
        if (toWrite)
            (0, PrintFunction_js_4.writeToFile)(fileName, (0, PrintFunction_js_4.printCsvCompare)(L, NL));
    }
});
//# sourceMappingURL=out.js.map
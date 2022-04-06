define(["require", "exports", "../automaton/Automaton.js", "../../public/noam.js"], function (require, exports, Automaton_js_1, noam_js_1) {
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
//# sourceMappingURL=automaton_type.js.map
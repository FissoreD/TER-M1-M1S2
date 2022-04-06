define(["require", "exports", "../automaton/Automaton.js"], function (require, exports, Automaton_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let a = new Automaton_js_1.Automaton({
        acceptingStates: ["0", "1"],
        alphabet: ["a"],
        startState: ["0"],
        states: ["0", "1"],
        transitions: [
            {
                fromState: "0",
                symbol: "a",
                toStates: ["1"]
            }
        ]
    });
    console.log(JSON.stringify(a, null, 4));
    console.log("-".repeat(50));
    console.log(JSON.stringify(a.minimize(), null, 4));
});
//# sourceMappingURL=Automaton_minimize_test.js.map
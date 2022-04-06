define(["require", "exports", "./PrintFunction.js", "../Teacher.js", "../lerners/L_star.js", "../lerners/NL_star.js"], function (require, exports, PrintFunction_js_1, Teacher_js_1, L_star_js_1, NL_star_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let fileName = "wrostDFA";
    (0, PrintFunction_js_1.clearFile)(fileName);
    (0, PrintFunction_js_1.writeToFile)(fileName, PrintFunction_js_1.csvHead);
    let regexList = [];
    for (let i = 0; i < 6; i++) {
        regexList.push("(a+b)*a" + "(a+b)".repeat(i));
    }
    let printInfo = (algo, algoName) => {
        return `${algoName} : queries = ${algo.member_number}, equiv = ${algo.equiv_number}, states = ${algo.automaton?.state_number()}, transitions = ${algo.automaton?.transition_number()}`;
    };
    for (const regex of regexList) {
        let teacher = new Teacher_js_1.Teacher("", regex);
        let L = new L_star_js_1.L_star(teacher);
        let NL = new NL_star_js_1.NL_star(teacher);
        L.make_all_queries();
        console.log(printInfo(L, "L*"));
        NL.make_all_queries();
        console.log(printInfo(NL, "NL*"));
        (0, PrintFunction_js_1.writeToFile)(fileName, (0, PrintFunction_js_1.printCsvCompare)(L, NL));
    }
});
//# sourceMappingURL=Test_wrost_DFA.js.map
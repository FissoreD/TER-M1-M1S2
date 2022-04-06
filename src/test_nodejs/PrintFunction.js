define(["require", "exports", "assert", "fs"], function (require, exports, assert_1, fs_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.writeToFile = exports.clearFile = exports.csvHead = exports.printCsvCompare = exports.printInfo = void 0;
    let printInfo = (algo, algoName) => {
        return `${algoName} : queries = ${algo.member_number}, equiv = ${algo.equiv_number}, states = ${algo.automaton?.state_number()}, transitions = ${algo.automaton?.transition_number()}`;
    };
    exports.printInfo = printInfo;
    let printCsvCompare = (L, NL) => {
        (0, assert_1.strict)(L.teacher == NL.teacher);
        return `${L.teacher.regex},${L.teacher.alphabet.length},${L.member_number},${L.equiv_number},${L.automaton?.state_number()},${L.automaton?.transition_number()},${NL.member_number},${NL.equiv_number},${NL.automaton?.state_number()},${NL.automaton?.transition_number()}`;
    };
    exports.printCsvCompare = printCsvCompare;
    exports.csvHead = "regex,Alp Length,L Member,L Equiv,L Aut State,L Aut Tran,NL Member,NL Equiv,NL Aut State,NL Aut Tran";
    let fileNameToCsv = (fileName) => "./statistics/" + fileName + ".csv";
    let clearFile = (fileName) => (0, fs_1.writeFileSync)(fileNameToCsv(fileName), "");
    exports.clearFile = clearFile;
    let writeToFile = (fileName, content) => {
        (0, fs_1.appendFileSync)(fileNameToCsv(fileName), content + "\n");
    };
    exports.writeToFile = writeToFile;
});
//# sourceMappingURL=PrintFunction.js.map
define(["require", "exports", "../lerners/NL_star.js", "../lerners/L_star.js", "../Teacher.js", "./PrintFunction.js"], function (require, exports, NL_star_js_1, L_star_js_1, Teacher_js_1, PrintFunction_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let fileName = "randomRegex";
    (0, PrintFunction_js_1.clearFile)(fileName);
    (0, PrintFunction_js_1.writeToFile)(fileName, PrintFunction_js_1.csvHead);
    for (const teacher of Teacher_js_1.teachers) {
        let L = new L_star_js_1.L_star(teacher);
        let NL = new NL_star_js_1.NL_star(teacher);
        console.log("==============================");
        console.log("Current regexp : ", teacher.regex);
        L.make_all_queries();
        (0, PrintFunction_js_1.printInfo)(L, "L*");
        NL.make_all_queries();
        (0, PrintFunction_js_1.printInfo)(L, "NL*");
        (0, PrintFunction_js_1.writeToFile)(fileName, (0, PrintFunction_js_1.printCsvCompare)(L, NL));
    }
});
//# sourceMappingURL=LernerCompare.js.map
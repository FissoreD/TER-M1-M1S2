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
define(["require", "exports", "./Teacher.js", "./html_interactions/HTML_L_star.js", "./html_interactions/HTML_NL_star.js", "./automaton/Automaton.js", "./lerners/L_star.js", "./lerners/NL_star.js", "./automaton/automaton_type.js"], function (require, exports, Teacher_js_1, HTML_L_star_js_1, HTML_NL_star_js_1, Automaton_js_1, L_star_js_1, NL_star_js_1, autFunction) {
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
        window.Automaton = Automaton_js_1.Automaton;
        window.Teacher = Teacher_js_1.Teacher;
        window.teachers = Teacher_js_1.teachers;
        window.L_star = L_star_js_1.L_star;
        window.NL_star = NL_star_js_1.NL_star;
        window.autFunction = autFunction;
        window.automatonDivList = exports.automatonDivList;
    }
});
//# sourceMappingURL=Main.js.map
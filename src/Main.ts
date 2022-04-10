import { Teacher, teachers } from "./teacher/Teacher.js";
import { HTML_L_star } from "./html_interactions/HTML_L_star.js";
import { HTML_NL_star } from "./html_interactions/HTML_NL_star.js";
import { Automaton } from "./automaton/Automaton.js";
import { L_star } from "./lerners/L_star.js";
import { NL_star } from "./lerners/NL_star.js";
import * as autFunction from "./automaton/automaton_type.js";
import { TeacherAutomaton } from "./teacher/TeacherAutomaton.js";

export let
  automatonDiv: HTMLDivElement,
  message: HTMLParagraphElement,
  tableHTML: HTMLTableElement,
  automatonHTML: HTMLDivElement,
  automatonDivList: [Automaton, Node][] = [];

export function initiate_global_vars() {
  automatonHTML = $("#automaton-mermaid")[0] as HTMLDivElement;
  automatonDiv = $("#input-automaton")[0] as HTMLDivElement;
  message = $("#message")[0] as HTMLParagraphElement;
  tableHTML = $("#table")[0] as HTMLTableElement;

  let current_automaton: HTML_NL_star | HTML_L_star,
    teacherSelector = $("#teacher-switch")[0] as HTMLSelectElement,
    teacherDescription = $("#teacher_description")[0] as HTMLParagraphElement,
    algoSelector = Array.from($(".algo-switch")) as HTMLInputElement[],
    mapTeacherValue: { [id: string]: Teacher } = {},
    counter = 0,
    currentTeacher: Teacher = teachers[0],
    newRegex = $("#input-regex")![0] as HTMLInputElement,
    newRegexSendButton = $("#button-regex")![0];

  let changeTeacherOrAlgo = () => {
    tableHTML.innerHTML = "";
    message.innerHTML = "";
    clear_automaton_HTML()
    current_automaton = algoSelector[0].checked ?
      new HTML_L_star(currentTeacher) :
      new HTML_NL_star(currentTeacher);
    teacherDescription.innerHTML = current_automaton.lerner.teacher.description;
    // @ts-ignore
    MathJax.typeset();
  }

  let createRadioTeacher = (teacher: Teacher) => {
    let newTeacherHtml = document.createElement("option");
    newTeacherHtml.value = counter + "";
    newTeacherHtml.text = teacher.regex;
    mapTeacherValue["" + counter++] = teacher;
    teacherSelector.appendChild(newTeacherHtml);
    return newTeacherHtml;
  };

  changeTeacherOrAlgo()
  teacherSelector.onchange = () => {
    currentTeacher = mapTeacherValue[teacherSelector.selectedOptions[0].value];
    changeTeacherOrAlgo();
  }

  algoSelector.forEach(as => as.onclick = () => changeTeacherOrAlgo());

  teachers.forEach((teacher) => createRadioTeacher(teacher));

  ($("#next_step")[0] as HTMLButtonElement).addEventListener("click", () => current_automaton.graphic_next_step());
  ($("#go_to_end")[0] as HTMLButtonElement).addEventListener("click", () => current_automaton.go_to_end());

  newRegexSendButton.addEventListener("click", () => {
    let regexAlreadyExists = Array.from($("#teacher-switch option")).find(e => (e as HTMLOptionElement).text == newRegex.value);
    let newTeacherOption: HTMLOptionElement;
    if (regexAlreadyExists) {
      newTeacherOption = regexAlreadyExists as HTMLOptionElement;
    } else {
      currentTeacher = new TeacherAutomaton(
        newRegex.value,
        `My automaton with regex = (${newRegex.value})`);
      newTeacherOption = createRadioTeacher(currentTeacher);
    }
    newTeacherOption.selected = true;
    changeTeacherOrAlgo();
  });

}

export function clear_automaton_HTML() {
  automatonDiv.innerHTML = "";
  automatonHTML.innerHTML = "";
}

declare global {
  interface Window {
    Automaton: any;
    teachers: Teacher[];
    L_star: any;
    NL_star: any;
    autFunction: any;
    automatonDivList: [Automaton, Node][];
  }
}


try {
  // @ts-ignore
  process == undefined;
} catch (e) {
  window.onload = function () {
    initiate_global_vars();
    // @ts-ignore
    resizableGrid($(".mainTable")[0]);
  }
  window.Automaton = Automaton;
  window.teachers = teachers;
  window.L_star = L_star;
  window.NL_star = NL_star;
  window.autFunction = autFunction;
  window.automatonDivList = automatonDivList;
}
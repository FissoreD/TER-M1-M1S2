import { Teacher, teachers } from "./Teacher.js";
import { HTML_L_star } from "./html_interactions/HTML_L_star.js";
import { HTML_NL_star } from "./html_interactions/HTML_NL_star.js";
import { Automaton } from "./automaton/Automaton.js";
import { L_star } from "./lerners/L_star.js";
import { NL_star } from "./lerners/NL_star.js";
import * as autFunction from "./automaton/automaton_type.js";

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

  let button_next = $("#next_step")[0] as HTMLButtonElement,
    current_automaton: HTML_NL_star | HTML_L_star,
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

  button_next.addEventListener("click", () => current_automaton.graphic_next_step());

  newRegexSendButton.addEventListener("click", () => {
    let regexAlreadyExists = Array.from($("#teacher-switch option")).find(e => (e as HTMLOptionElement).text == newRegex.value);
    let newTeacherOption: HTMLOptionElement;
    if (regexAlreadyExists) {
      newTeacherOption = regexAlreadyExists as HTMLOptionElement;
    } else {
      currentTeacher = new Teacher(
        `My automaton with regex = (${newRegex.value})`,
        newRegex.value, _s => true, []);
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
    Teacher: any;
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
  window.Teacher = Teacher;
  window.teachers = teachers;
  window.L_star = L_star;
  window.NL_star = NL_star;
  window.autFunction = autFunction;
  window.automatonDivList = automatonDivList;
}
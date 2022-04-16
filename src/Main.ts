import { Teacher, teachers } from "./teacher/Teacher.js";
import { HTML_L_star } from "./html_interactions/HTML_L_star.js";
import { HTML_NL_star } from "./html_interactions/HTML_NL_star.js";
import { Automaton } from "./automaton/Automaton.js";
import { L_star } from "./learners/L_star.js";
import { NL_star } from "./learners/NL_star.js";
import * as autFunction from "./automaton/automaton_type.js";
import { TeacherAutomaton } from "./teacher/TeacherAutomaton.js";

export let
  automatonDiv: HTMLDivElement,
  automatonHTML: HTMLDivElement,
  automatonDivList: [Automaton, Node][] = [],
  historyHTML: [HTMLElement, Automaton?][] = [],
  historyPosition = 0,
  backupCenterDiv = document.getElementById('centerDiv')!.cloneNode(true);

export function centerDivClone() {
  return backupCenterDiv.cloneNode(true);
}

export function initiate_global_vars() {
  automatonHTML = $("#automaton-mermaid")[0] as HTMLDivElement;
  automatonDiv = $("#input-automaton")[0] as HTMLDivElement;
  historyHTML.push([document.getElementById('centerDiv')!.cloneNode(true) as HTMLElement, undefined])

  document.getElementById('leftCol')!.onclick = goBackward
  document.getElementById('rightCol')!.onclick = goForeward

  document.onkeydown = (key) => {
    const LEFT = 37,
      RIGHT = 39;
    switch (key.keyCode) {
      case LEFT:
        goBackward();
        break;
      case RIGHT:
        goForeward();
        break;
    }
  }

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
    document.getElementById('centerDiv')!.replaceWith(centerDivClone());
    current_automaton = algoSelector[0].checked ?
      new HTML_L_star(currentTeacher) :
      new HTML_NL_star(currentTeacher);
    teacherDescription.innerHTML = current_automaton.learner.teacher.description;
    // @ts-ignore
    MathJax.typeset();
    clearHistory();
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

  ($("#next_step")[0] as HTMLButtonElement).addEventListener("click", () => current_automaton.next_step());
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

function toggleArrowLeft(toDisplay: boolean) {
  if (toDisplay) document.getElementById('leftCol')?.classList.remove('hide');
  else document.getElementById('leftCol')?.classList.add('hide');
}

function toggleArrowRight(toDisplay: boolean) {
  if (toDisplay) document.getElementById('rightCol')?.classList.remove('hide');
  else document.getElementById('rightCol')?.classList.add('hide');
}

export function addHistoryElement(automaton?: Automaton) {
  historyHTML.push([document.getElementById('centerDiv')!.cloneNode(true) as HTMLElement, automaton]);
  historyPosition = historyHTML.length - 1
  toggleArrowRight(false)
  toggleArrowLeft(true)
}

function changeMainDivContent() {
  console.log(historyHTML, historyPosition, historyHTML[historyPosition], historyHTML[historyPosition]);
  document.getElementById('centerDiv')!.innerHTML = historyHTML[historyPosition][0].innerHTML!;
}

function clearHistory() {
  historyHTML = [];
  toggleArrowLeft(false);
  toggleArrowRight(false);
  clear_automaton_HTML();
}

export function goForeward() {
  let lengthHistory = historyHTML.length;
  if (historyPosition + 1 < lengthHistory) {
    historyPosition++;
    changeMainDivContent();
    toggleArrowLeft(true);
  } else {
    toggleArrowRight(false);
  }
}

export function goBackward() {
  if (historyPosition > 0) {
    historyPosition--;
    changeMainDivContent();
    toggleArrowRight(true);
  } else {
    toggleArrowLeft(false);
  }
}

export function clear_table() {
  document.getElementById('table')!.innerHTML = "";
  document.getElementById('table')!.innerHTML = "";
}

export function clear_automaton_HTML() {
  document.getElementsByClassName('mermaidTooltip')[0]?.remove();
  document.getElementById('automatonHead')?.classList.add('up');
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
    historyHTML: [Node, Automaton?][];
    historyPosition: number;
  }
}


try {
  // @ts-ignore
  process == undefined;
} catch (e) {
  window.onload = function () {
    initiate_global_vars();
    // @ts-ignore
    // resizableGrid($(".mainTable")[0]);
  }
  window.Automaton = Automaton;
  window.teachers = teachers;
  window.L_star = L_star;
  window.NL_star = NL_star;
  window.autFunction = autFunction;
  window.automatonDivList = automatonDivList;
  window.historyHTML = historyHTML;
  window.historyPosition = historyPosition;
}
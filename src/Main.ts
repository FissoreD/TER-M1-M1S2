import { Teacher, teachers } from "./teacher/Teacher.js";
import { HTML_L_star } from "./html_interactions/HTML_L_star.js";
import { HTML_NL_star } from "./html_interactions/HTML_NL_star.js";
import { Automaton } from "./automaton/Automaton.js";
import { L_star } from "./learners/L_star.js";
import { NL_star } from "./learners/NL_star.js";
import * as autFunction from "./automaton/automaton_type.js";
import { TeacherAutomaton } from "./teacher/TeacherAutomaton.js";
import { TeacherUser } from "./teacher/TeacherUser.js";
import { myLog } from "./tools/Utilities.js";

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

  $('#leftCol span')[0]!.onclick = goBackward
  $('#rightCol span')[0]!.onclick = goForeward

  document.onkeydown = (key) => {
    switch (key.code) {
      case 'ArrowLeft':
        goBackward();
        break;
      case 'ArrowRight':
        goForeward();
        break;
    }
  }

  let current_automaton: HTML_NL_star | HTML_L_star,
    teacherSelector = $("#teacher-switch")[0] as HTMLSelectElement,
    algoSelector = Array.from($(".algo-switch")) as HTMLInputElement[],
    mapTeacherValue: { [id: string]: Teacher } = {},
    counter = 0,
    currentTeacher: Teacher = teachers[0],
    newRegex = $("#input-regex")![0] as HTMLInputElement,
    newRegexSendButton = $("#button-regex")![0];

  let changeTeacherOrAlgo = () => {
    ($("#next_step")[0] as HTMLButtonElement).classList.remove('hide');
    ($("#go_to_end")[0] as HTMLButtonElement).classList.remove('hide');
    document.getElementById('centerDiv')!.replaceWith(centerDivClone());
    current_automaton = algoSelector[0].checked ?
      new HTML_L_star(currentTeacher) :
      new HTML_NL_star(currentTeacher);
    $("#teacher_description")[0].innerHTML = current_automaton.learner.teacher.description;
    myLog("The description is ", current_automaton.learner.teacher.description);

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
  ($("#restart_algo")[0] as HTMLButtonElement).addEventListener("click", () => changeTeacherOrAlgo());

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

  $('#radio-userTeacher')[0].onclick = () => {
    $('#teacher-switch')[0].setAttribute('disabled', '');
    currentTeacher = new TeacherUser()
    changeTeacherOrAlgo()
  }
  $('#radio-pcTeacher')[0].onclick = () => {
    $('#teacher-switch')[0].removeAttribute('disabled');
    currentTeacher = mapTeacherValue[teacherSelector.selectedOptions[0].value];
    changeTeacherOrAlgo()
  }
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
  // let historyHead = Array.from(historyHTML[historyPosition][0].getElementsByClassName('head'))
  // let currentHead = Array.from(document.getElementsByClassName('head'))
  // historyHead.forEach((e, pos) => {
  //   if (currentHead[pos].classList.contains('up')) e.classList.add('up');
  //   else e.classList.remove('up');
  // })
  document.getElementById('centerDiv')!.innerHTML = historyHTML[historyPosition][0].innerHTML;
  window.automaton = historyHTML[historyPosition][1];
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
    automaton: Automaton | undefined;
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
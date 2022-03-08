import { Teacher, teacherA3fromLast, teacherEvenAandThreeB, teacherNotAfourthPos, teacherPairZeroAndOne, teachers } from "./Teacher.js";
import { L_star } from "./L_star/L_star.js";
import { HTML_L_star } from "./html_interactions/HTML_L_star.js";
import { HTML_NL_star } from "./html_interactions/HTML_NL_star.js";

export let
  automatonDiv: HTMLDivElement,
  message: HTMLParagraphElement,
  tableHTML: HTMLTableElement,
  automatonHTML: HTMLDivElement;

export function initiate_global_vars() {
  let listener = (teacher: Teacher) => {
    tableHTML.innerHTML = "";
    message.innerHTML = "";
    clear_automaton_HTML()
    current_automaton = radioAlgo[0].checked ?
      new HTML_L_star(teacher) :
      new HTML_NL_star(teacher);
    teacher_description_HTML.innerHTML = current_automaton.teacher.description;
    // @ts-ignore
    MathJax.typeset();
  }

  automatonHTML = document.getElementById("automaton-mermaid") as HTMLDivElement;
  automatonDiv = document.getElementById("input-automaton") as HTMLDivElement;
  let button_next = document.getElementById("next_step") as HTMLButtonElement;
  message = document.getElementById("message") as HTMLParagraphElement;
  tableHTML = document.getElementById("table") as HTMLTableElement;

  let current_automaton: HTML_NL_star | HTML_L_star;

  let teacher_switch_HTML = document.getElementById("teacher_switch") as HTMLDivElement;
  let teacher_description_HTML = document.getElementById("teacher_description") as HTMLParagraphElement;
  let radioAlgo = Array.from(document.getElementsByClassName("algo-switch")) as HTMLInputElement[];

  radioAlgo.forEach(e => {
    e.addEventListener("click", () => listener(current_automaton.teacher))
  })

  teachers.forEach((teacher, pos) => {
    let radioTeacher = document.createElement("input");
    let label = document.createElement("label");
    let span = document.createElement("span");

    radioTeacher.type = 'radio';
    radioTeacher.name = 'teacher_switcher'
    span.innerHTML = pos + "";

    radioTeacher.addEventListener("click", () => {
      listener(teacher);
    });

    label.appendChild(radioTeacher);
    label.append(span);
    teacher_switch_HTML.appendChild(label);

    if (pos == 1) { radioTeacher.click(); }
  });

  button_next.addEventListener("click", () => {
    current_automaton.graphic_next_step()
  });
}

export function clear_automaton_HTML() {
  automatonDiv.innerHTML = "";
  automatonHTML.innerHTML = "";
}

// console.log(process.argv);
try {
  // @ts-ignore
  process == undefined;
  console.log("HERE");
} catch (e) {
  // @ts-ignore
  window.onload = initiate_global_vars();
}

// mainMonoid()
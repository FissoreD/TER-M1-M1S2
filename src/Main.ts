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
  automatonHTML = $("#automaton-mermaid")[0] as HTMLDivElement;
  automatonDiv = $("#input-automaton")[0] as HTMLDivElement;
  let button_next = $("#next_step")[0] as HTMLButtonElement;
  message = $("#message")[0] as HTMLParagraphElement;
  tableHTML = $("#table")[0] as HTMLTableElement;

  let current_automaton: HTML_NL_star | HTML_L_star;

  let teacher_switch_HTML = $("#teacher_switch")[0] as HTMLDivElement;
  let teacher_description_HTML = $("#teacher_description")[0] as HTMLParagraphElement;
  let radioAlgo = Array.from($(".algo-switch")) as HTMLInputElement[];
  let conterRadioButton = 0;

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

  let createRadioTeacher = (teacher: Teacher) => {
    let radioTeacher = document.createElement("input");
    let label = document.createElement("label");
    let span = document.createElement("span");

    radioTeacher.type = 'radio';
    radioTeacher.name = 'teacher_switcher'
    span.innerHTML = conterRadioButton++ + "";

    radioTeacher.addEventListener("click", () => {
      listener(teacher);
    });

    label.appendChild(radioTeacher);
    label.append(span);
    teacher_switch_HTML.appendChild(label);
    label.addEventListener("contextmenu", (ev) => {
      console.log("here");
      ev.preventDefault();
      teacher_switch_HTML.removeChild(label);
      console.log("there");

    })
    return radioTeacher;
  };

  radioAlgo.forEach(e => {
    e.addEventListener("click", () => listener(current_automaton.teacher))
  })

  teachers.forEach((teacher, pos) => {
    let radioTeacher = createRadioTeacher(teacher);
    if (pos == 0) radioTeacher.click();
  });

  button_next.addEventListener("click", () => {
    current_automaton.graphic_next_step()
  });

  let regexAutButton = $("#input-regex")![0] as HTMLInputElement;
  let alphabetAutButton = $("#input-alphabet")![0] as HTMLInputElement;
  let createAutButton = $("#button-regex")![0];
  createAutButton.addEventListener("click", () => {
    let teacher = new Teacher(`My automaton with regex = (${regexAutButton.value}) over &Sigma; = {${Array.from(alphabetAutButton.value)}} `, alphabetAutButton.value,
      sentence =>
        sentence.match(new RegExp("^(" + regexAutButton.value + ")$")) != undefined,
      []);
    console.log(teacher);

    let radioTeacher = createRadioTeacher(teacher)
    radioTeacher.click()
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
import { teacherA3fromLast, teacherEvenAandThreeB, teacherPairZeroAndOne } from "./Teacher.js";
import { L_star } from "./L_star/L_star.js";
import { HTML_LStar } from "./L_star/HTML_L_star.js";

export let
  automatonDiv: HTMLDivElement,
  current_automaton: L_star | HTML_LStar,
  message: HTMLParagraphElement,
  tableHTML: HTMLTableElement,
  automatonHTML: HTMLDivElement;

export function initiate_global_vars() {

  automatonHTML = document.getElementById("automaton-mermaid") as HTMLDivElement;
  automatonDiv = document.getElementById("input-automaton") as HTMLDivElement;
  let button_next = document.getElementById("next_step") as HTMLButtonElement;
  message = document.getElementById("message") as HTMLParagraphElement;
  tableHTML = document.getElementById("table") as HTMLTableElement;

  let teacher_switch_HTML = document.getElementById("teacher_switch") as HTMLDivElement;
  let teacher_description_HTML = document.getElementById("teacher_description") as HTMLParagraphElement;

  let automata = [
    new HTML_LStar("01", teacherPairZeroAndOne),
    new HTML_LStar("ab", teacherA3fromLast),
    new HTML_LStar("ab", teacherEvenAandThreeB)];

  automata.forEach((a, pos) => {
    let radio = document.createElement("input");
    let label = document.createElement("label");
    let span = document.createElement("span");

    radio.type = 'radio';
    radio.name = 'teacher_switcher'
    span.innerHTML = pos + "";

    radio.addEventListener("click", () => {
      current_automaton = a;
      teacher_description_HTML.innerHTML = a.teacher.description;
    });

    label.appendChild(radio);
    label.append(span);
    teacher_switch_HTML.appendChild(label);

    if (pos == 0) { radio.click(); }
  });

  button_next.addEventListener("click", () => (current_automaton as HTML_LStar).graphic_next_step());
}

export function clear_automaton_HTML() {
  automatonDiv.innerHTML = "";
  automatonHTML.innerHTML = "";
}

// console.log(process.argv);
try {
  process == undefined;
  console.log("HERE");
} catch (e) {
  initiate_global_vars();
}

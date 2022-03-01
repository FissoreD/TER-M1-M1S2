import { HTML_LStar } from "./L_star/HTML_L_star.js";
import { Teacher } from "./Teacher.js";


let button_next = document.getElementById("next_step") as HTMLButtonElement;
button_next.addEventListener("click", () => A.graphic_next_step());

export let message = document.getElementById("message") as HTMLParagraphElement;

export let tableHTML = document.getElementById("table") as HTMLTableElement;

export let automatonHTML = document.getElementById("automaton-mermaid") as HTMLDivElement;
export let automatonDiv = document.getElementById("input-automaton") as HTMLDivElement;
export let A = new HTML_LStar("01", new Teacher());

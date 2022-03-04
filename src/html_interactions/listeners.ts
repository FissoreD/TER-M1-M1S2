import { Automaton } from "../Automaton";

export function listener_automaton_click_button(a: Automaton) {
  let next_char = () => {
    let dom = document.getElementById('input')!;
    let name = dom.innerText;
    let currentNode = name[0];
    name = name.substring(1);
    a.draw_next_step(currentNode);
    dom.innerText = name;
  };
  let x = document.getElementById("next_char")!
  x.addEventListener("click", next_char);
}

export function set_text() {
  let form = document.getElementById("form1") as HTMLFormElement;
  let str = form.getAttribute("id");
  document.getElementById("input")!.innerText = str as string;
}
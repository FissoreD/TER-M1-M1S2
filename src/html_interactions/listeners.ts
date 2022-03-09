import { Automaton } from "../Automaton";

export function listener_automaton_click_button(a: Automaton) {
  let next_char = () => {
    let dom = $('#input')[0];
    let name = dom.innerText;
    let currentNode = name[0];
    name = name.substring(1);
    a.draw_next_step(currentNode);
    dom.innerText = name;
  };
  let x = $("#next_char")[0]
  x.addEventListener("click", next_char);
}

export function set_text() {
  let form = $("#form1")[0];
  let str = form.getAttribute("id");
  $("#input")[0].innerText = str as string;
}
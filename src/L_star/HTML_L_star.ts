import { Automaton } from "../Automaton";
import { automatonDiv, automatonHTML, message, tableHTML } from "../Main";
import { Teacher } from "../Teacher";
import { L_star } from "./L_star";

type myFunction = { (data: void): void; };
export class HTML_LStar extends L_star {
  table_header: HTMLTableSectionElement;
  table_body: HTMLTableSectionElement;
  pile_actions: myFunction[];
  automaton: Automaton | undefined;

  constructor(alphabet: string, teacher: Teacher) {
    super(alphabet, teacher);
    this.table_header = tableHTML.createTHead();
    this.table_body = tableHTML.createTBody();
    this.pile_actions = [() => this.draw_table()];
  }

  draw_table() {
    this.add_row(this.table_header, "Table", undefined, this.E, 2);

    /**
     The first {@link S}.length rows of the table start with the S symbol
    */
    var fst: string | undefined = "S";
    for (var s of this.S) {
      const row = Array.from(this.observation_table[s]);
      this.add_row(this.table_body, fst, s, row, 1, fst ? this.S.length : 1);
      fst = undefined;
    }
    /**
     In the second part of the table, rows start with the SA symbol
    */
    var fst: string | undefined = "SA";
    for (var s of this.SA) {
      const row = Array.from(this.observation_table[s]);
      this.add_row(this.table_body, fst, s, row, 1, fst ? this.SA.length : 1);
      fst = undefined;
    }
  }

  set_header() {

  }

  add_row(
    parent: HTMLTableSectionElement, fst: string | undefined, head: string | undefined,
    row_elts: string[], colspan: number = 1, rowspan: number = 1
  ) {

    let conver_to_epsilon = (e: string) => e == "" ? "&epsilon;" : e;
    let create_cell_with_text = (row: HTMLTableRowElement, txt: string) => {
      var cell = row.insertCell();
      cell.innerHTML = `${conver_to_epsilon(txt)}`
    };
    console.log(head ? conver_to_epsilon(head) : "Not head", row_elts);
    var row = parent.insertRow();
    if (fst) {
      var cell = row.insertCell();
      cell.setAttribute("rowspan", rowspan + "");
      cell.setAttribute("colspan", colspan + "");
      cell.innerHTML = conver_to_epsilon(fst);
    }
    if (head != undefined) create_cell_with_text(row, head);
    for (var letter of row_elts)
      create_cell_with_text(row, letter)
  }

  clear_table() {
    this.table_body.innerHTML = "";
    this.table_header.innerHTML = "";
    console.log("Clearing");
  }

  clear_automaton() {
    automatonDiv.innerHTML = "";
    automatonHTML.innerHTML = "";
  }

  graphic_next_step() {
    if (this.pile_actions.length > 0) {
      let action = this.pile_actions.shift() as myFunction;
      action();
      return;
    }
    const close_rep = this.is_close();
    if (close_rep != undefined) {
      message.innerText =
        `
        The table is not closed since
        row(${close_rep}) = ${this.observation_table[close_rep]} but there is no s in S such that row(s) = ${this.observation_table[close_rep]};
        I'm going to move ${close_rep} from SA to S
        `
      this.pile_actions.push(() => {
        message.innerText = "";
        this.add_elt_in_S(close_rep);
        this.clear_table();
        this.draw_table();
      });
      return;
    }
    const consistence_rep = this.is_consistent()
    if (consistence_rep != undefined) {
      message.innerText =
        `
        The table is not consistent : 
        row(${consistence_rep[0]}) and row(${consistence_rep[1]}) have same value in S,
        but their value is not the same if we add ${consistence_rep[2]} 
        (row(${consistence_rep[0] + consistence_rep[2]}) != row(${consistence_rep[1] + consistence_rep[2]}))
        I'm going to add the column ${consistence_rep[2]}
        `;
      this.pile_actions.push(() => {
        message.innerText = "";
        this.add_column(consistence_rep[2]);
        this.clear_table();
        this.draw_table();
      });
      return;
    }
    if (message.innerHTML != "") return;
    message.innerText =
      `
      The table is consistent and closed, I will send an automaton
      `;
    let automaton = this.make_automaton();

    this.automaton = automaton;
    this.pile_actions.push(() => {
      automaton.initiate_graph();
      this.add_automaton_listener();
      let answer = this.make_member(automaton);
      if (answer != undefined) {
        message.innerText =
          `
        The sent automaton is not valid, 
        here is a counter-exemple ${answer}
        `;
        this.pile_actions.push(() => {
          message.innerHTML = "";
          this.clear_automaton()
          this.add_elt_in_S(answer!);
          this.clear_table();
          this.draw_table();
        })
        return;
      }
      message.innerHTML = "The Teacher has accepted the automaton";
    });
  }

  private add_automaton_listener() {
    let input = document.createElement("input");
    let setB = document.createElement("button");
    setB.innerHTML = "Reinitialize automaton";
    setB.addEventListener('click', () => {
      this.automaton!.restart();
      this.automaton!.initiate_graph();
    })
    let sendB = document.createElement("button")
    sendB.innerHTML = "Next char";
    sendB.addEventListener('click', () => {
      this.automaton!.draw_next_step(input.value[0])
      input.value = input.value.slice(1);
    });
    automatonDiv.appendChild(input);
    automatonDiv.appendChild(sendB);
    automatonDiv.appendChild(setB);
  }
}
import { Automaton } from "../Automaton.js";
import { automatonDiv, clear_automaton_HTML, message, tableHTML } from "../Main.js";
import { Teacher } from "../Teacher.js";
import { myFunction } from "../Utilities.js";
import { L_star } from "../L_star/L_star.js";

export class HTML_L_star extends L_star {
  table_header: HTMLTableSectionElement;
  table_body: HTMLTableSectionElement;
  pile_actions: myFunction<void, void>[];
  automaton: Automaton | undefined;
  table_counter = 0;

  constructor(teacher: Teacher) {
    super(teacher);

    this.table_header = tableHTML.createTHead();
    this.table_body = tableHTML.createTBody();
    this.pile_actions = [() => this.draw_table()];
  }

  draw_table() {
    this.add_row_html(this.table_header, "Table" + this.table_counter++, undefined, this.E, 2);

    /**
     The first {@link S}.length rows of the table start with the S symbol
    */
    var fst: string | undefined = "S";
    for (var s of this.S) {
      const row = Array.from(this.observation_table[s]);
      this.add_row_html(this.table_body, fst, s, row, 1, fst ? this.S.length : 1);
      fst = undefined;
    }
    /**
     In the second part of the table, rows start with the SA symbol
    */
    var fst: string | undefined = "SA";
    for (var s of this.SA) {
      const row = Array.from(this.observation_table[s]);
      this.add_row_html(this.table_body, fst, s, row, 1, fst ? this.SA.length : 1);
      fst = undefined;
    }
  }

  add_row_html(
    parent: HTMLTableSectionElement, fst: string | undefined, head: string | undefined,
    row_elts: string[], colspan: number = 1, rowspan: number = 1
  ) {
    let convert_to_epsilon = (e: string) => e == "" ? "&epsilon;" : e;
    let create_cell_with_text = (row: HTMLTableRowElement, txt: string) => {
      var cell = row.insertCell();
      cell.innerHTML = `${convert_to_epsilon(txt)}`
    };

    var row = parent.insertRow();
    if (fst) {
      row.style.borderTop = "2px solid #009879";
      var cell = document.createElement('th');
      cell.setAttribute("rowspan", rowspan + "");
      cell.setAttribute("colspan", colspan + "");
      cell.innerHTML = convert_to_epsilon(fst);
      row.appendChild(cell);
    }
    if (head != undefined) create_cell_with_text(row, head);
    for (var letter of row_elts)
      create_cell_with_text(row, letter)
  }

  clear_table() {
    this.table_body.innerHTML = "";
    this.table_header.innerHTML = "";
  }

  graphic_next_step() {
    if (this.finish) {
      if (message.innerHTML != "")
        message.innerHTML = "The Teacher has accepted the automaton";
    }
    else if (this.pile_actions.length > 0) {
      this.pile_actions.shift()!()
    }
    else if (!this.close_action()) { }
    else if (!this.consistence_action()) { }
    else this.send_automaton_action()
    message.innerHTML =
      `Queries = ${this.query_number} - Membership = ${this.member_number} <br>
      ${message.innerHTML}`
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

  close_action(): boolean {
    const close_rep = this.is_close();
    if (close_rep != undefined) {
      message.innerText =
        `The table is not closed since
        row(${close_rep}) = ${this.observation_table[close_rep]} but there is no s in S such that row(s) = ${this.observation_table[close_rep]};
        I'm going to move ${close_rep} from SA to S`
      this.pile_actions.push(() => {
        message.innerText = "";
        this.add_elt_in_S(close_rep);
        this.clear_table();
        this.draw_table();
      });
      return false;
    }
    return true;
  }

  consistence_action(): boolean {
    const consistence_rep = this.is_consistent()
    if (consistence_rep != undefined) {
      let new_col = this.find_suffix_not_compatible(consistence_rep)
      let s1 = consistence_rep[0];
      let s2 = consistence_rep[1];
      let a = consistence_rep[2];
      message.innerText =
        `The table is not consistent : 
        row(${s1 ? s1 : "ε"}) and row(${s2 ? s2 : "ε"}) have same value in S,
        but their value is not the same if we add ${a} 
        row(${s1 + a}) != row(${s2 + a})
        I'm going to add the column ${new_col} since T(${s1 + new_col}) != T(${s2 + new_col})`;
      this.pile_actions.push(() => {
        message.innerText = "";
        this.add_column(new_col);
        this.clear_table();
        this.draw_table();
      });
      return false;
    }
    return true;
  }

  send_automaton_action() {
    message.innerText =
      `The table is consistent and closed, I will send an automaton`;
    let automaton = this.make_automaton();

    this.automaton = automaton;
    this.pile_actions.push(() => {
      message.innerHTML = "";
      automaton.initiate_graph();
      this.add_automaton_listener();
      let answer = this.make_member(automaton);
      if (answer != undefined) {
        message.innerText =
          `The sent automaton is not valid, 
          here is a counter-exemple ${answer}`;
        this.pile_actions.push(() => {
          message.innerHTML = "";
          clear_automaton_HTML();
          this.add_elt_in_S(answer!);
          this.clear_table();
          this.draw_table();
        })
        return;
      }
      this.finish = true;
    });
  }
}
import { Automaton } from "../automaton/Automaton.js";
import { LearnerBase } from "../learners/LearnerBase.js";
import { addHistoryElement, automatonDiv, centerDivClone, clear_automaton_HTML, historyHTML } from "../Main.js";
import { myFunction } from "../tools/Utilities.js";

export abstract class HTML_LearnerBase<T extends LearnerBase> {
  learner: T;

  table_header: HTMLTableSectionElement;
  table_body: HTMLTableSectionElement;
  pile_actions: myFunction<void, void>[];
  automaton: Automaton | undefined;
  tableHTML: HTMLTableElement;
  table_counter = 0;
  stopNextStep = false;

  constructor(learner: T) {
    this.learner = learner;
    this.pile_actions = [() => this.draw_table()];

    this.tableHTML = document.createElement('table');
    this.table_header = this.tableHTML.createTHead();
    this.table_body = this.tableHTML.createTBody();
  }

  draw_table() {
    this.add_row_html(this.table_header!, "Table" + this.table_counter++, undefined, this.learner.E, 2);

    /**
     The first {@link S}.length rows of the table start with the S symbol
    */
    var fst: string | undefined = "S";
    for (var s of this.learner.S) {
      const row = Array.from(this.learner.observation_table[s]);
      this.add_row_html(this.table_body!, fst, s, row, 1, fst ? this.learner.S.length : 1);
      fst = undefined;
    }
    /**
     In the second part of the table, rows start with the SA symbol
    */
    var fst: string | undefined = "SA";
    for (var s of this.learner.SA) {
      const row = Array.from(this.learner.observation_table[s]);
      this.add_row_html(this.table_body!, fst, s, row, 1, fst ? this.learner.SA.length : 1);
      fst = undefined;
    }

    document.getElementById('tableHead')?.classList.remove('up');
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
    return row;
  }

  clear_table() {
    this.table_body!.innerHTML = "";
    this.table_header!.innerHTML = "";
  }

  next_step() {
    if (this.stopNextStep) return;
    document.getElementById('centerDiv')!.replaceWith(centerDivClone());
    if (this.pile_actions.length > 0) this.pile_actions.shift()!()
    else if (!this.close_action()) { }
    else if (!this.consistence_action()) { }
    else this.send_automaton_action()
    this.message().innerHTML =
      `Queries = ${this.learner.member_number} - Membership = ${this.learner.equiv_number}` + (this.learner.automaton ? ` - States = ${this.learner.automaton?.state_number()} - Transitions = ${this.learner.automaton?.transition_number()}` : ``) + `<br> ${this.message().innerHTML}`
    if (this.learner.finish) {
      this.message().innerHTML += "The Teacher has accepted the automaton";
      this.stopNextStep = true
    }
    // @ts-ignore
    MathJax.typeset()
    document.getElementById('messageHead')?.classList.remove('up');
    document.getElementById('tableHead')?.classList.remove('up');
    document.getElementById('teacher_description')?.classList.remove('up');

    document.getElementById('table')!.innerHTML = this.tableHTML.innerHTML;
    document.getElementById('teacher_description')!.innerHTML = this.learner.teacher.description;
    // @ts-ignore
    MathJax.typeset();
    addHistoryElement(this.automaton);
  }

  close_action(): boolean {
    const close_rep = this.learner.is_close();
    if (close_rep != undefined) {
      this.message().innerText =
        this.close_message(close_rep);
      this.pile_actions.push(() => {
        this.message().innerText = "";
        this.learner.add_elt_in_S(close_rep);
        this.clear_table();
        this.draw_table();
      });
      return false;
    }
    return true;
  }

  consistence_action(): boolean {
    const consistence_rep = this.learner.is_consistent()
    if (consistence_rep != undefined) {
      let s1 = consistence_rep[0];
      let s2 = consistence_rep[1];
      let new_col = consistence_rep[2]
      this.message().innerText = this.consistent_message(s1, s2, new_col);
      this.pile_actions.push(() => {
        this.message().innerText = "";
        this.learner.add_elt_in_E(new_col);
        this.clear_table();
        this.draw_table();
      });
      return false;
    }
    return true;
  }

  send_automaton_action() {
    this.message().innerText =
      `The table is consistent and closed, I will send an automaton`;
    let automaton = this.learner.make_automaton();

    this.automaton = automaton;
    this.pile_actions.push(() => {
      this.message().innerHTML = "";
      automaton.initiate_graph();
      this.add_automaton_listener();
      let answer = this.learner.make_equiv(automaton);


      if (answer != undefined) {
        this.message().innerText =
          `The sent automaton is not valid, 
          here is a counter-exemple ${answer}`;
        this.pile_actions.push(() => {
          this.message().innerHTML = "";
          clear_automaton_HTML();
          this.table_to_update_after_equiv(answer!)
          this.clear_table();
          this.draw_table();
        })
        return;
      }
      this.learner.finish = true;
    });
  }

  abstract close_message(close_rep: string): string;

  abstract consistent_message(s1: string, s2: string, new_col: string): string;

  abstract table_to_update_after_equiv(answer: string): void;

  add_automaton_listener() {
    let input = document.createElement("input");
    let setB = document.createElement("button");
    setB.innerHTML = "Reinitialize automaton";
    setB.addEventListener('click', () => {
      this.automaton!.restart();
      this.automaton!.initiate_graph();
    })
    let nextB = document.createElement("button")
    nextB.innerHTML = "Next char";
    nextB.addEventListener('click', () => {
      this.automaton!.draw_next_step(input.value[0])
      input.value = input.value.slice(1);
    });
    automatonDiv.appendChild(input);
    automatonDiv.appendChild(nextB);
    automatonDiv.appendChild(setB);
    let acceptB = document.createElement("button");
    let answerP = document.createElement("p");
    acceptB.innerHTML = "In automaton";
    acceptB.addEventListener("click", () => {
      let aut_answer = this.automaton?.accept_word_nfa(input.value);
      answerP.innerHTML = `The word ${input.value} is${aut_answer ? "" : " not"} accepted`
    })
    automatonDiv.appendChild(acceptB);
    automatonDiv.appendChild(answerP);
  }

  go_to_end() {
    // if (this.learner.finish) return
    while (!this.learner.finish) {
      this.next_step();
    }
    // this.learner.make_all_queries()
    // this.clear_table()
    // this.draw_table()
    // clear_automaton_HTML();
    // this.learner.automaton?.initiate_graph()
    // this.next_step()
  }

  message() {
    return document.getElementById('message')!
  }
}
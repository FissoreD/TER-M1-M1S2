export interface AutomatonJson {
  transitions: string[][][],
  startState: string,
  endState: string[],
  alphabet: string[] | string,
  states: string[]
};

export class Automaton implements AutomatonJson {
  transitions: string[][][];
  startState: string;
  endState: string[];
  alphabet: string | string[];
  states: string[];
  currentState: string;

  constructor(json: AutomatonJson) {
    this.transitions = json.transitions;
    this.startState = json.startState;
    this.endState = json.endState;
    this.currentState = this.startState;
    this.alphabet = Array.from(json.alphabet);
    this.states = json.states;
  }

  next_step(next_char: string) {
    let x = this.states.indexOf(this.currentState);
    let y = this.alphabet.indexOf(next_char);
    this.currentState = this.transitions[x][y][0];
  }

  accept_word(word: string): boolean {
    this.restart()
    Array.from(word).forEach(
      letter => this.next_step(letter)
    )
    let is_accepted = this.endState.includes(this.currentState);
    this.restart()
    return is_accepted;
  }

  accept_word_nfa(word: string): boolean {
    let recursive_explore = (word: string, index: number, current_state: string): boolean => {
      if (index < word.length) {
        let x = this.states.indexOf(current_state);
        let y = this.alphabet.indexOf(word[index]);
        let next_states = this.transitions[x][y];
        return next_states.some(next_state => recursive_explore(word, index + 1, next_state))
      } else {
        return this.endState.includes(current_state);
      }
    }
    return recursive_explore(word, 0, this.startState);
  }


  restart() {
    this.currentState = this.startState;
  }

  /** GRAPHIC PART */

  draw_next_step(next_char: string) {
    this.color_node(false);
    this.next_step(next_char);
    this.color_node(true);
  }

  initiate_graph() {
    let automatonHTML = document.getElementById("automaton-mermaid") as HTMLDivElement;
    automatonHTML.removeAttribute('data-processed')
    automatonHTML.innerHTML = this.matrix_to_mermaid();

    // @ts-ignore
    mermaid.init(document.querySelectorAll(".mermaid"));

    // Mark end nodes
    this.endState.forEach(n => {
      let circle = this.get_current_graph_node(n);
      let smaller_circle = circle.cloneNode() as HTMLElement;
      // @ts-ignore
      (smaller_circle).attributes['r'].value -= 3
      circle.parentNode!.insertBefore(smaller_circle, circle.nextSibling)
    });

    // Mark current node = initial state
    this.color_node(true);
  }

  get_current_graph_node(node: string) {
    let elts = document.querySelectorAll('.node').values();
    let currentNode = elts.next();

    while (elts) {
      if (currentNode.value.getElementsByClassName('nodeLabel')[0].innerHTML == node)
        break;
      currentNode = elts.next();
    }
    return currentNode.value.firstChild! as HTMLElement;
  }

  matrix_to_mermaid(): string {
    let res = "flowchart LR";
    res = res.concat("\n" + this.create_entering_arrow() + "\n");
    let triples: { [id: string]: string[] } = {}
    for (let i = 0; i < this.states.length; i++) {
      for (let j = 0; j < this.alphabet.length; j++) {
        for (const state of this.transitions[i][j]) {
          let stateA_concat_stateB = this.states[i] + '&' + state;
          if (triples[stateA_concat_stateB]) {
            triples[stateA_concat_stateB].push(this.alphabet[j])
          } else {
            triples[stateA_concat_stateB] = [this.alphabet[j]]
          }
          // res = res.concat("\n");
          // res = res.concat(
          //   this.create_triple(
          //     this.states[i],
          //     this.alphabet[j],
          //     state));
        }
      }
    }
    res = res.concat(Object.keys(triples).map(x => this.create_triple(x, triples[x].join(","))).join("\n"));
    console.log(res);
    res = res.concat("\nstyle START fill:#FFFFFF, stroke:#FFFFFF;")
    return res;
  }


  color_node(toFill: boolean) {
    let current_circle = this.get_current_graph_node(this.currentState) as HTMLElement;
    let next_circle = current_circle.nextSibling as HTMLElement;
    if (toFill) {
      if (this.endState.includes(this.currentState))
        next_circle.style.fill = '#009879';
      else current_circle.style.fill = '#009879';
    } else {
      if (this.endState.includes(this.currentState))
        next_circle.removeAttribute('style');
      else current_circle.removeAttribute('style');
    }
  }

  create_triple(states: string, transition: string): string {
    let split = states.split("&");
    let A = split[0], B = split[1];
    return `${A}((${A})) -->| ${transition} | ${B}((${B}))`;
  }

  create_entering_arrow(): string {
    return `START[ ]--> ${this.startState}`
  }
}
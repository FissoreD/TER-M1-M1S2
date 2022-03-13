export interface Transition {
  fromState: string,
  toStates: string[],
  symbol: string
}

export interface AutomatonJson {
  transitions: Transition[],
  startState: string[],
  acceptingStates: string[],
  alphabet: string[] | string,
  states: string[]
};

export class Automaton implements AutomatonJson {
  transitions: Transition[];
  startState: string[];
  acceptingStates: string[];
  alphabet: string | string[];
  states: string[];
  states_rename: string[];
  currentStates: string[];

  constructor(json: AutomatonJson) {
    this.transitions = json.transitions;
    this.startState = json.startState;
    this.acceptingStates = json.acceptingStates;
    this.currentStates = this.startState;
    this.alphabet = Array.from(json.alphabet);
    this.states = json.states;
    this.states_rename = [];
    let counter_init = [0, this.startState.length, this.states.length - this.acceptingStates.length + 1];
    for (let i = 0; i < this.states.length; i++) {
      if (this.startState.includes(this.states[i])) {
        this.states_rename.push("q" + counter_init[0]++)
      } else if (this.acceptingStates.includes(this.states[i])) {
        this.states_rename.push("q" + counter_init[2]++)
      } else {
        this.states_rename.push("q" + counter_init[1]++)
      }
    }
  }

  next_step(next_char: string) {
    let newCurrentState: string[] = []
    this.currentStates.forEach(cs => {
      let nextStates = this.find_transition(cs, next_char).toStates
      nextStates.forEach(nextState => {
        if (!newCurrentState.includes(nextState)) {
          newCurrentState.push(nextState)
        }
      })
    })
    this.currentStates = newCurrentState;
  }

  accept_word(word: string): boolean {
    this.restart()
    Array.from(word).forEach(
      letter => this.next_step(letter)
    )
    let is_accepted = this.acceptingStates.some(e => this.currentStates.includes(e));
    this.restart()
    return is_accepted;
  }

  find_transition(state: string, symbol: string) {
    return this.transitions
      .filter(e => e.fromState == state)
      .find(e => e.symbol == symbol)!
  }

  accept_word_nfa(word: string): [boolean, string[]] {
    let path: string[] = [];
    let recursive_explore = (word: string, index: number, current_state: string, state_path: string): boolean => {
      if (index < word.length) {
        let next_states = this.find_transition(current_state, word[index]).toStates;
        return next_states.some(next_state => recursive_explore(word, index + 1, next_state, state_path + ", " + this.get_state_rename(next_state)))
      } else {
        if (this.acceptingStates.includes(current_state)) {
          path = [state_path]
          return true;
        }
        path.push(state_path)
        return false;
      }
    }
    let is_accepted: boolean = false;
    for (const start_state of this.startState) {
      is_accepted = recursive_explore(word, 0, start_state, this.get_state_rename(start_state));
      if (is_accepted) break;
    }

    return [is_accepted, path];
  }

  restart() {
    this.currentStates = this.startState;
  }

  /** GRAPHIC PART */

  draw_next_step(next_char: string) {
    this.color_node(false);
    this.next_step(next_char);
    this.color_node(true);
  }

  initiate_graph() {
    let automatonHTML = $("#automaton-mermaid")[0];
    automatonHTML.removeAttribute('data-processed')
    automatonHTML.innerHTML = this.matrix_to_mermaid();

    // @ts-ignore
    mermaid.init($(".mermaid"));

    // Mark end nodes
    this.acceptingStates.forEach(n => {
      let circle = this.get_current_graph_node(n) as HTMLElement;
      circle.style.strokeWidth = "1.1";
      circle.style.stroke = "black"
      let smaller_circle = circle.cloneNode() as HTMLElement;
      // @ts-ignore
      smaller_circle.attributes['r'].value -= 4
      circle.parentNode!.insertBefore(smaller_circle, circle.nextSibling)
    });

    // Mark current node = initial state
    this.color_node(true);
    $(".mermaid")[0].after($(".mermaidTooltip")[0])
    $('svg')[0].style.height = 'auto'
  }

  get_current_graph_node(node: string) {
    return Array.from($(".node")).find(e => e.id.split("-")[1] == node)!.firstChild!;
  }

  matrix_to_mermaid(): string {
    let res = "flowchart LR\n";
    res = res.concat("subgraph Automaton\ndirection LR\n")
    // res = res.concat("\n" + this.create_entering_arrow() + "\n");
    let triples: { [id: string]: string[] } = {}
    for (let i = 0; i < this.states.length; i++) {
      for (let j = 0; j < this.alphabet.length; j++) {
        for (const state of this.find_transition(this.states[i], this.alphabet[j]).toStates) {
          let stateA_concat_stateB = this.states[i] + '&' + state;
          if (triples[stateA_concat_stateB]) {
            triples[stateA_concat_stateB].push(this.alphabet[j])
          } else {
            triples[stateA_concat_stateB] = [this.alphabet[j]]
          }
        }
      }
    }
    res = res.concat(Object.keys(triples).map(x => this.create_triple(x, triples[x].join(","))).join("\n"));
    // res = res.concat("\nstyle START fill:#FFFFFF, stroke:#FFFFFF;")
    res += "\n"
    // res = res.concat(this.startState.map(e => `style ${e} fill:#FFFF00, stroke:#FF00FF;\n`).join(""));
    res += "subgraph InitialStates\n";
    res += this.startState.map(e => e).join("\n")
    res += "\nend"
    res += "\n"
    res += "end\n"
    // Callback for tooltip on mouse over
    res = res.concat(this.states.map(e => `click ${e} undefinedCallback "${e}";`).join("\n"))
    console.log(res);
    return res;
  }


  color_node(toFill: boolean) {
    this.currentStates.forEach(currentState => {
      let current_circle = this.get_current_graph_node(currentState) as HTMLElement;
      let next_circle = current_circle.nextSibling as HTMLElement;
      if (toFill) {
        next_circle.style.textDecoration = "underline";
        if (this.acceptingStates.includes(currentState))
          next_circle.style.fill = '#009879';
        else current_circle.style.fill = '#009879';
      } else {
        if (this.acceptingStates.includes(currentState))
          next_circle.removeAttribute('style');
        else current_circle.removeAttribute('style');
      }
    })
    // let currentNode = this.get_current_graph_node(this.currentState).parentElement as HTMLElement;
    // let spanWithText = currentNode.getElementsByClassName("nodeLabel")![0] as HTMLElement;
    // if (toFill) {
    //   spanWithText.style.textDecoration = "underline";
    // } else {
    //   spanWithText.removeAttribute('style');
    // }
  }

  create_triple(states: string, transition: string): string {
    let split = states.split("&");
    let A = split[0], B = split[1];
    let A_rename = this.get_state_rename(A);
    let B_rename = this.get_state_rename(B);
    return `${A}((${A_rename})) -->| ${transition} | ${B}((${B_rename}))`;
  }

  create_entering_arrow(): string {
    return `START[ ]--> ${this.startState}`
  }

  get_state_rename(name: string) {
    // return name;
    return this.states_rename[this.states.indexOf(name)]
  }
}
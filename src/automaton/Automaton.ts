export class State {
  isAccepting: boolean;
  isInitial: boolean;
  alphabet: string[];
  transitions: Map<string, State[]>
  name: string;

  constructor(name: string, isAccepting: boolean, isInitial: boolean, alphabet: string[]) {
    this.name = name;
    this.isAccepting = isAccepting;
    this.isInitial = isInitial;
    this.alphabet = alphabet;
    this.transitions = new Map()
    for (const symbol of alphabet) {
      this.transitions.set(symbol, [])
    }
  }

  addTransition(symbol: string, state: State) {
    this.transitions.get(symbol)!.push(state);
  }
}

export interface AutomatonJson {
  states: Map<string, State>;
  initialStates: State[];
  acceptingStates: State[];
  alphabet: string[];
};

export class Automaton implements AutomatonJson {
  states: Map<string, State>;
  initialStates: State[];
  acceptingStates: State[];
  alphabet: string[];
  currentStates: State[];
  states_rename: Map<string, string>;

  constructor(json: AutomatonJson) {
    this.initialStates = json.initialStates;
    this.acceptingStates = json.acceptingStates;
    this.currentStates = this.initialStates;
    this.alphabet = Array.from(json.alphabet);
    this.states = json.states;
    this.states_rename = new Map();
    this.set_state_rename()
  }

  set_state_rename() {
    let counter_init = [0, this.initialStates.length, this.states.size - this.acceptingStates.length + 1];
    for (const [_name, state] of this.states) {
      if (this.initialStates.includes(state)) {
        this.states_rename.set(state.name, "q" + counter_init[0]++)
      } else if (this.acceptingStates.includes(state)) {
        this.states_rename.set(state.name, "q" + counter_init[2]++)
      } else {
        this.states_rename.set(state.name, "q" + counter_init[1]++)
      }
    }
  }

  next_step(next_char: string) {
    let newCurrentState: State[] = []
    this.currentStates.forEach(cs => {
      let nextStates = cs.transitions.get(next_char)!;
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

  // find_transition(state: string, symbol: string) {
  //   return this.transitions
  //     .filter(e => e.fromState == state)
  //     .find(e => e.symbol == symbol)!
  // }


  /* {TODO} */
  accept_word_nfa(word: string): boolean {
    // let path: string[] = [];
    // let recursive_explore = (word: string, index: number, current_state: State, state_path: string): boolean => {
    //   if (index < word.length) {
    //     let next_states = this.find_transition(current_state, word[index]).toStates;
    //     return next_states.some(next_state => recursive_explore(word, index + 1, next_state, state_path + ", " + this.get_state_rename(next_state)))
    //   } else {
    //     if (this.acceptingStates.includes(current_state)) {
    //       path = [state_path]
    //       return true;
    //     }
    //     path.push(state_path)
    //     return false;
    //   }
    // }
    // console.log(1);

    let nextStates: Set<State> = new Set(this.initialStates);
    for (let index = 0; index < word.length && nextStates.size > 0; index++) {
      let nextStates2: Set<State> = new Set();
      const symbol = word[index];
      for (const state of nextStates) {
        Array.from(this.findTransition(state, symbol)).forEach(e => nextStates2.add(e))
      }
      nextStates = nextStates2;
    }
    // console.log(2);
    return Array.from(nextStates).some(e => e.isAccepting);
  }

  findTransition(state: State, symbol: string) {
    return this.states.get(state.name)!.transitions.get(symbol)!
  }

  restart() {
    this.currentStates = this.initialStates;
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

  get_current_graph_node(node: State) {
    return Array.from($(".node")).find(e => e.id.split("-")[1] == node.name)!.firstChild!;
  }

  matrix_to_mermaid(): string {
    let res = "flowchart LR\n";
    res = res.concat("subgraph Automaton\ndirection LR\n")
    // res = res.concat("\n" + this.create_entering_arrow() + "\n");
    let triples: { [id: string]: string[] } = {}
    for (const [name, state] of this.states) {
      for (let j = 0; j < this.alphabet.length; j++) {
        for (const nextState of this.findTransition(state, this.alphabet[j])) {
          let stateA_concat_stateB = name + '&' + nextState.name;
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
    // res = res.concat(this.initialStates.map(e => `style ${e} fill:#FFFF00, stroke:#FF00FF;\n`).join(""));
    res += "subgraph InitialStates\n";
    res += this.initialStates.map(e => e.name).join("\n")
    res += "\nend"
    res += "\n"
    res += "end\n"
    // Callback for tooltip on mouse over
    res = res.concat(Array.from(this.states).map(([name, _]) => `click ${name} undnamefinedCallback "${name}";`).join("\n"))
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
    return `START[ ]--> ${this.initialStates}`
  }

  get_state_rename(name: string) {
    return this.states_rename.get(name)!
  }

  state_number() {
    return this.states.size;
  }

  transition_number() {
    return Array.from(this.states).map(e => Array.from(e[1].transitions)).flat().reduce((a, b) => a + b[1].length, 0)
  }

  // minimize() {
  //   let couples: string[][] = []
  //   let separable = new Set();
  //   for (let i1 = 0; i1 < this.states.size; i1++) {
  //     for (let i2 = i1 + 1; i2 < this.states.size; i2++) {
  //       if (this.acceptingStates.includes(this.states[i1]) != this.acceptingStates.includes(this.states[i2])) separable.add(`${this.states[i1]}-${this.states[i2]}`)
  //       else couples.push([this.states[i1], this.states[i2]]);
  //     }
  //   }
  //   while (true) {
  //     let oldLength = couples.length;
  //     couples = couples.filter(e => {
  //       let fst = e[0], snd = e[1];
  //       let tr0 = this.transitions.filter(t => t.fromState == fst);
  //       let tr1 = this.transitions.filter(t => t.fromState == snd);
  //       for (const letter of this.alphabet) {
  //         let t1 = tr0.find(e => e.symbol == letter)?.toStates
  //         let t2 = tr1.find(e => e.symbol == letter)?.toStates
  //         if (t1 && t2) {
  //           for (const x of t1) {
  //             for (const y of t2) {
  //               if (separable.has(`${x}-${y}`) || separable.has(`${y}-${x}`)) {
  //                 separable.add(`${fst}-${snd}`)
  //                 return false;
  //               }
  //             }
  //           }
  //         }
  //       }
  //       return true;
  //     })
  //     if (couples.length == oldLength) break
  //   }

  //   for (const couple of couples) {
  //     this.transitions.filter(e => e.fromState == couple[1]).forEach(
  //       s => {
  //         let tr;
  //         if (tr = this.transitions.find(t => t.fromState == couple[0] && t.symbol == s.symbol)) {
  //           for (const next of s.toStates) {
  //             if (!tr.toStates.includes(next)) tr.toStates.push(next)
  //           }
  //         } else {
  //           this.transitions.push({ fromState: couple[0], symbol: s.symbol, toStates: s.toStates })
  //         }
  //       }
  //     )
  //     if (this.initialStates.includes(couple[1])) {
  //       this.initialStates = this.initialStates.filter(e => e != couple[1])
  //       if (!this.initialStates.includes(couple[0])) this.initialStates.push(couple[0])
  //     }
  //     this.acceptingStates = this.acceptingStates.filter(e => e != couple[1])
  //     this.states = this.states.filter(e => e != couple[1])
  //     this.transitions = this.transitions.filter(e => e.fromState != couple[1])
  //     this.transitions.forEach(e => e.toStates = e.toStates.filter(x => x != couple[1]))
  //     this.transitions = this.transitions.filter(t => t.toStates.length != 0)
  //   }

  //   this.set_state_rename()
  //   console.log(Array.from(separable), couples);
  //   return this;
  // }
}
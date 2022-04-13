import { strict } from "assert";

export class State {
  isAccepting: boolean;
  isInitial: boolean;
  alphabet: string[];
  outTransitions: Map<string, State[]>;
  inTransitions: Map<string, State[]>;
  successors: Set<State>;
  predecessor: Set<State>;
  name: string;

  constructor(name: string, isAccepting: boolean, isInitial: boolean, alphabet: string[]) {
    this.name = name;
    this.isAccepting = isAccepting;
    this.isInitial = isInitial;
    this.alphabet = alphabet;
    this.outTransitions = new Map();
    this.inTransitions = new Map();
    this.successors = new Set();
    this.predecessor = new Set();
    for (const symbol of alphabet) {
      this.outTransitions.set(symbol, []);
      this.inTransitions.set(symbol, []);
    }
  }

  addTransition(symbol: string, state: State) {
    if (this.outTransitions.get(symbol)!.includes(state)) return
    this.outTransitions.get(symbol)!.push(state);
    this.successors.add(state);
    state.predecessor.add(this);
    state.inTransitions.get(symbol)!.push(this);
  }

  getSuccessor(symbol: string) {
    return this.outTransitions.get(symbol)!
  }

  getPredecessor(symbol: string) {
    return this.inTransitions.get(symbol)!
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
  allStates: State[];
  alphabet: string[];
  currentStates: State[];
  states_rename: Map<string, string>;

  constructor(stateList: Set<State>) {
    this.allStates = Array.from(stateList);
    this.initialStates = this.allStates.filter(s => s.isInitial);
    this.acceptingStates = this.allStates.filter(s => s.isAccepting);
    this.currentStates = this.initialStates;
    this.alphabet = this.initialStates[0].alphabet;
    this.states = new Map();
    stateList.forEach(e => this.states.set(e.name, e));
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
      let nextStates = cs.outTransitions.get(next_char)!;
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


  accept_word_nfa(word: string): boolean {
    let nextStates: Set<State> = new Set(this.initialStates);
    for (let index = 0; index < word.length && nextStates.size > 0; index++) {
      let nextStates2: Set<State> = new Set();
      const symbol = word[index];
      for (const state of nextStates) {
        Array.from(this.findTransition(state, symbol)).forEach(e => nextStates2.add(e))
      }
      nextStates = nextStates2;
    }
    return Array.from(nextStates).some(e => e.isAccepting);
  }

  findTransition(state: State, symbol: string) {
    return this.states.get(state.name)!.outTransitions.get(symbol)!
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
    res += "\nsubgraph InitialStates\n";
    res += this.initialStates.map(e => e.name).join("\n")
    res += "\nend"
    res += "\n"
    res += "end\n"
    res = res.concat(this.acceptingStates.map(e => `style ${e.name} fill:#FFFF00, stroke:#FF00FF;\n`).join(""));
    res += "\n"
    // Callback for tooltip on mouse over
    res = res.concat(Array.from(this.states).map(([name, _]) => `click ${name} undnamefinedCallback "${name}";`).join("\n"))
    // console.log(res);
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
    return Array.from(this.states).map(e => Array.from(e[1].outTransitions)).flat().reduce((a, b) => a + b[1].length, 0)
  }


  /**
   * Usage of Filling table algorithm for Automaton Minimisation
   * The automaton should be in DFA form else the algorithm won't work
   */
  minimize() {

    let stateList: State[] = [this.initialStates[0]];

    // BFS to remove not reachable node from initial state
    let toExplore = [this.initialStates[0]]
    while (toExplore.length > 0) {
      let newState = toExplore.shift()!
      for (const successor of newState.successors) {
        if (!stateList.includes(successor)) {
          toExplore.push(successor)
          stateList.push(successor)
        }
      }
    }


    let P: Set<State>[] = [new Set(), new Set()]; // P := {F, Q \ F}
    stateList.forEach(s => (s.isAccepting ? P[0] : P[1]).add(s))
    P = P.filter(p => p.size > 0)

    let pLength = () => P.reduce((a, p) => a + p.size, 0)

    let W: Set<State>[] = Array.from(P) // W := {F, Q \ F}
    while (W.length > 0) {
      let A = W.shift()!
      for (const letter of this.alphabet) {
        // X = the set of states for which a transition on letter leads to a state in A
        let X: Set<State> = new Set()
        A.forEach(e => {
          let succ = e.inTransitions.get(letter)
          if (succ) succ.forEach(s => X.add(s))
        })

        // let S1 = X ∩ Y and S2 = Y \ X and S3 = X \ Y and Y in P
        let Y = P.map(p => {
          let S1: Set<State> = new Set(),
            S2: Set<State> = new Set();
          for (const state of p) {
            if (X.has(state)) S1.add(state)
            else S2.add(state)
          }
          return { y: p, S1: S1, S2: S2 }
        }).filter(({ S1, S2 }) => S1.size > 0 && S2.size > 0)
        for (const { y, S1, S2 } of Y) {
          // replace Y in P by the two sets X ∩ Y and Y \ X
          P.splice(P.indexOf(y), 1)
          P.push(S1)
          P.push(S2)
          if (pLength() != stateList.length) throw `Wanted ${stateList.length} had ${pLength()}`
          if (W.includes(y)) {
            W.splice(W.indexOf(y), 1)
            W.push(S1)
            W.push(S2)
          } else {
            if (S1.size <= S2.size) {
              W.push(S1)
            } else {
              W.push(S2)
            }
          }
        }
      }
    }

    let oldStateToNewState: Map<State, State> = new Map();



    let newStates = new Set(Array.from(P).filter(partition => partition.size > 0).map((partition, pos) => {
      let representant = Array.from(partition)
      let newState = new State(pos + "",
        representant.some(e => e.isAccepting),
        representant.some(e => e.isInitial),
        representant[0].alphabet
      )
      partition.forEach(state => oldStateToNewState.set(state, newState))
      return newState;
    }));

    for (const partition of P) {
      for (const oldState of partition) {
        for (const letter of this.alphabet) {
          for (const successor of oldState.getSuccessor(letter)) {
            if (!oldStateToNewState.get(oldState)!.outTransitions.get(letter)![0] || (oldStateToNewState.get(oldState)!.outTransitions.get(letter)![0].name != oldStateToNewState.get(successor)!.name))
              oldStateToNewState.get(oldState)!.addTransition(letter, oldStateToNewState.get(successor)!)
          }
        }
      }
    }

    console.log(Array.from(newStates).filter(s => s.isInitial).length);

    return new Automaton(newStates)
  }
}
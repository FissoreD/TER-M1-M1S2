import { myLog } from "../tools/Utilities.js";

export class State {
  isAccepting: boolean;
  isInitial: boolean;
  alphabet: string[];
  outTransitions: Map<string, State[]>;
  inTransitions: Map<string, State[]>;
  successors: Set<State>;
  predecessor: Set<State>;
  name: string;

  constructor(name: string, isAccepting: boolean, isInitial: boolean, alphabet: string[] | string) {
    this.name = name;
    this.isAccepting = isAccepting;
    this.isInitial = isInitial;
    this.alphabet = Array.from(alphabet);
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

  static bottom(alphabet: string[]) {
    return new State("bottom", false, false, alphabet)
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
  /**
   * If the HTML page can continue next action after Automaton
   * with graphviz has been loaded
   */
  continueAction = true;

  constructor(stateList: Set<State> | State[]) {
    stateList = new Set(stateList);
    this.complete(stateList)
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

  complete(stateList: Set<State>) {
    let alphabet = stateList.values().next().value.alphabet
    let bottom = State.bottom(alphabet)
    for (const state of stateList) {
      for (const symbol of alphabet) {
        if (this.findTransition(state, symbol).length == 0) {
          stateList.add(bottom);
          state.addTransition(symbol, bottom);
        }
      }
    }
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
    if (next_char == undefined) return
    let newCurrentState: State[] = []
    this.currentStates.forEach(cs => {
      let nextStates = cs.outTransitions.get(next_char);
      if (nextStates) {
        nextStates.forEach(nextState => {
          if (!newCurrentState.includes(nextState)) {
            newCurrentState.push(nextState)
          }
        })
      } else {
        alert("The letter you entered in not in the alphabet !\n The automaton has been reinitialized");
        this.restart_graph()
        return
      }
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
    if (word.length == 0)
      return this.initialStates.some(e => e.isAccepting);
    let nextStates: Set<State> = new Set(this.initialStates);
    for (let index = 0; index < word.length && nextStates.size > 0; index++) {
      let nextStates2: Set<State> = new Set();
      const symbol = word[index];
      if (!this.alphabet.includes(symbol)) {
        alert("The word you entered contains a letter which is not in the alphabet !\nThe automaton has been reinitialized");
        return false
      }
      for (const state of nextStates) {
        for (const nextState of this.findTransition(state, symbol)) {
          nextStates2.add(nextState)
          if (index == word.length - 1 && nextState.isAccepting)
            return true
        }
        // Array.from(this.findTransition(state, symbol)).forEach(e => nextStates2.add(e))
      }
      nextStates = nextStates2;
    }
    return false;
  }

  findTransition(state: State, symbol: string) {
    return state!.outTransitions.get(symbol)!
  }

  /** Automaton current state is restored to initial state */
  restart() {
    this.currentStates = this.initialStates;
  }

  /** GRAPHIC PART */

  draw_next_step(next_char: string) {
    this.color_node(false);
    this.next_step(next_char);
    this.color_node(true);
  }

  /**
   * Create a dot file corresponding to the current automaton and 
   * display it in the automaton section
   */
  initiate_graph() {
    this.continueAction = false;
    document.getElementById('automatonHead')?.classList.remove('up');
    let txt = this.automatonToDot();

    //@ts-ignore
    return d3.select("#graph").graphviz()
      .dot(txt).zoom(false)
      .render(() => {
        this.continueAction = true;
        this.color_node(true);
      });
  }

  restart_graph() {
    this.color_node(false)
    this.restart()
    this.color_node(true)
  }

  get_current_graph_node(node: State) {
    let text = Array.from($('.node title')).find(e => e.innerHTML == node.name)!;
    return text.nextSibling?.nextSibling! as HTMLElement;
  }

  matrix_to_mermaid(): string {
    let mermaidTxt = "flowchart LR\n";
    mermaidTxt = mermaidTxt.concat("\ndirection LR\n")

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
    mermaidTxt = mermaidTxt.concat(Object.keys(triples).map(x => this.create_triple(x, triples[x].join(","))).join("\n"));

    mermaidTxt += "\n"
    mermaidTxt += "\nsubgraph InitialStates\n";
    mermaidTxt += this.initialStates.map(e => e.name).join("\n")
    mermaidTxt += "\nend"
    mermaidTxt += "\n"
    mermaidTxt = mermaidTxt.concat(this.acceptingStates.map(e => `style ${e.name} fill:#FFFF00, stroke:#FF00FF;\n`).join(""));
    mermaidTxt += "\n"
    // Callback for tooltip on mouse over
    mermaidTxt = mermaidTxt.concat(Array.from(this.states).map(([name, _]) => `click ${name} undnamefinedCallback "${name}";`).join("\n"))
    myLog({ a: [mermaidTxt] });

    this.automatonToDot()
    return mermaidTxt;
  }

  automatonToDot() {
    let txt = "digraph {rankdir = LR\n"
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

    txt = txt.concat(
      this.allStates.map(e => `${e.name} [label="${this.get_state_rename(e.name)
        }", shape=circle]`).join("\n"));
    txt += '\n';

    txt = txt.concat(Object.keys(triples).map(x => {
      let [states, transition] = [x, triples[x].join(",")]
      let split = states.split("&");
      let A = split[0], B = split[1];
      return `${A} -> ${B} [label = "${transition}"]`
    }).join("\n"));

    this.initialStates.forEach(s => {
      txt = txt.concat(`\nI${s.name} [label="", style=invis, width=0]\nI${s.name} -> ${s.name}`);
    });

    this.acceptingStates.forEach(s => {
      txt = txt.concat(`\n${s.name} [shape=doublecircle]`)
      myLog({ a: ["here"] });

    })

    txt += "\n}"
    console.log(txt);

    return txt
  }


  color_node(toFill: boolean) {
    this.currentStates.forEach(currentState => {
      let current_circle = this.get_current_graph_node(currentState);
      if (toFill) {
        current_circle.classList.add('currentNode');
      } else {
        current_circle.classList.remove('currentNode');
      }
    })
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
   * Usage of Filling table algorithm for Automaton Minimisation \
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

    return new Automaton(newStates)
  }

  static strToAutomaton(content: String) {
    const SYMBOL_LIST = Array.from("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

    let sContent = content.split("\n");
    let IN_INITIAL = 0, IN_TRANSITION = 1, IN_ACCEPTING = 2;
    let statePhase = IN_INITIAL;
    const initalState: string[] = [], acceptingStates: string[] = [],
      transitions: { current: string, symbol: string, next: string }[] = [],
      statesName: Set<string> = new Set(), alphabetSet: Set<string> = new Set();
    for (const line of sContent) {
      if (!line.includes("-")) {
        let stateName = line.substring(line.indexOf('[') + 1, line.indexOf(']'));
        statesName.add(stateName)
        if (statePhase == IN_INITIAL) {
          initalState.push(stateName);
        } else {
          statePhase = IN_ACCEPTING;
          acceptingStates.push(stateName)
        }
      } else if (line.match(/[a-zA-Z0-9]+/)) {
        statePhase = IN_TRANSITION;
        let split = line.match(/[A-Za-z0-9]+/g)!;
        let current = split[1];
        let symbol = split[0];
        let next = split[2];
        transitions.push({
          current: current,
          next: next,
          symbol: symbol
        })
        statesName.add(current);
        statesName.add(next);
        alphabetSet.add(symbol);
      }
    }
    let alphabet = Array.from(alphabetSet);
    let alphabetOneLetter = SYMBOL_LIST.splice(0, alphabet.length)
    let stateMap: Map<string, State> = new Map();
    let stateSet: Set<State> = new Set();
    statesName.forEach(e => {
      let state = new State(e, acceptingStates.includes(e), initalState.includes(e), alphabetOneLetter)
      stateMap.set(e, state);
      stateSet.add(state)
    });
    transitions.forEach(({ current, symbol, next }) =>
      stateMap.get(current)!.addTransition(
        alphabetOneLetter[alphabet.indexOf(symbol)],
        stateMap.get(next)!)
    )

    let automaton = new Automaton(stateSet);
    return automaton;

  }

  toString() {
    let txt: String[] = [];
    this.initialStates.forEach(e => txt.push('[' + e.name + "]"));
    this.allStates.forEach(state =>
      state.outTransitions.forEach((nextStates, symbol) => nextStates.forEach(next => txt.push(`${symbol},[${state.name}]->[${next.name}]`))));
    this.acceptingStates.forEach(e => txt.push("[" + e.name + "]"));
    return txt.join('\n');
  }
}
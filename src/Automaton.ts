
export type AutomatonJson =
  {
    transitions: string[][],
    startNode: string,
    endNodes: string[],
    alphabet: string[] | string,
    states: string[]
  };
export class Automaton {
  transitions: string[][];
  startNode: string;
  endNodes: string[];
  currentNode: string;
  alphabet: string[];
  nodes: string[];

  constructor(json: AutomatonJson) {
    this.transitions = json.transitions;
    this.startNode = json.startNode;
    this.endNodes = json.endNodes;
    this.currentNode = this.startNode;
    this.alphabet = Array.from(json.alphabet);
    this.nodes = json.states;
  }

  next_step(next_char: string) {
    let x = this.nodes.indexOf(this.currentNode);
    let y = this.alphabet.indexOf(next_char);
    this.currentNode = this.transitions[x][y];
  }


  restart() {
    this.currentNode = this.startNode;
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
    this.endNodes.forEach(n => {
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
    res = res.concat("\n" + this.create_entering_arrow());
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = 0; j < this.alphabet.length; j++) {
        res = res.concat("\n");
        res = res.concat(
          this.create_triple(
            this.nodes[i],
            this.alphabet[j],
            this.transitions[i][j]));
      }
    }
    res = res.concat("\nstyle START fill:#FFFFFF, stroke:#FFFFFF;")
    console.log(res);

    return res;
  }


  color_node(toFill: boolean) {
    let current_circle = this.get_current_graph_node(this.currentNode) as HTMLElement;
    let next_circle = current_circle.nextSibling as HTMLElement;
    if (toFill) {
      if (this.endNodes.includes(this.currentNode))
        next_circle.style.fill = '#009879';
      else current_circle.style.fill = '#009879';
    } else {
      if (this.endNodes.includes(this.currentNode))
        next_circle.removeAttribute('style');
      else current_circle.removeAttribute('style');
    }
  }

  create_triple(A: string, transition: string, B: string): string {
    return `${A}((${A})) -->| ${transition} | ${B}((${B}))`;
  }

  create_entering_arrow(): string {
    return `START[ ]--> ${this.startNode}`
  }
}
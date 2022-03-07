// import { Automaton } from "../Automaton.js";
// import { even_zero_one } from "../models/teacher_models.js";

// export class Monoid {
//   automaton: Automaton;
//   state_passage: string[];
//   letter_passage: string[];
//   matrix_passage: string[][];

//   constructor(automaton: Automaton) {
//     this.automaton = automaton;
//     this.state_passage = [];
//     this.letter_passage = [];
//     this.matrix_passage = [];
//     this.automaton.alphabet.forEach(l => {
//       this.letter_passage.push(l);
//       this.state_passage.push(automaton.startState);
//     })
//   }

//   calculate_monoids() {
//     let l = this.automaton.alphabet;
//     console.log("here");

//     while (l.length > 0) {
//       let current_word = l.pop()!
//       console.log(current_word);
//       this.letter_passage.push(current_word);
//       this.state_passage.push(this.automaton.currentState);
//       // this.matrix_passage.
//     }
//     console.log(this.letter_passage);
//     console.log(this.state_passage);


//   }
// }

// export function mainMonoid() {
//   let aut = new Automaton(even_zero_one)
//   let mon = new Monoid(aut);
//   mon.calculate_monoids()
// }

// mainMonoid()
import { L_star } from "L_star/L_star";
import { Teacher } from "Teacher";

const L = new L_star(['0', '1'], new Teacher());

console.log(123);


L.define_next_questions();
console.log(123);

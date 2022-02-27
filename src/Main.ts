import { Automaton } from "./Automaton.js";
import { L_star } from "./L_star/L_star.js";
import { Teacher } from "./Teacher.js";
import * as data from "./Teacher_models/even0_1.json"
import { listener_automaton_click_button } from "./Utilities.js";


const L = new L_star('01', new Teacher());

L.define_next_questions();

let a = new Automaton(data.even_zero_one)

a.initiate_graph()


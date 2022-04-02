## Pdf file description

> This folder contains the main pdf files studied and used as source for the project development

---

Short description of each file :

- [angluin87.pdf](angluin87.pdf) : talks about the L* algorithm aiming to construct a minimal <ins>deterministc</ins> automaton recognizing a language *L* which is at start unknown. We can imagine to have a Tacher that knows *L* and a Lerner wanting to learn *L*. The Lerner can interact with the Teacher thanks to membership queries (if a word *w* belongs to *L*) and equivalence queries (if an automaton *A* accept exactly *L*, in the negative case, the Teacher will send a word *w'* belonging either to *L* if *w'* is not in *L(A)* or the complement of *L* if *w'* is in *L(A)*). The Lerner will have understood *L* when the built automaton will be accepted by the Teacher.
- [angluin-nfa-bolling.pdf](angluin-nfa-bollig.pdf) : talks about the NL* algorithm, a variant of *L\** where the Lerner wants to build a smaller automaton *A* (that is with less states) then the one built by the L* algorithm. *A* will belong to the RFSA class of automata a sub-class of <ins>not-deterministic finite state* automaton</ins>. 
- [Residual_Finite_State_Automata.pdf](Residual_Finite_State_Automata.pdf) : talks about the RFSA class of automaton. This kind of automaton has the characteristic that all of its states represent a residual of the language. 


---
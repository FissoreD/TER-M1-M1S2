# Comparison of L* and NL* algorithm 


ABSTRACT:
Angluin's L* algorithm [[1]](#1) is a famous algorithm for learning deterministic finite state automata from
membership and equivalence queries. 
Bollig et al NL* [[2]](#2) algorithm is a variant of this algorithm, where the automaton that is learned may be
non deterministic, and therefore exponentially more succinct. 
The goal of this TERD is to understand the theory behind these two algorithms, and if the time permits,
to implement them and compare them. 



## About the project
This project has been realized in Spring 2022 with reference to the course "Travail Encadré de Recherche" within the Master 1 in *Computer Science* at the University *Côte d'Azur* in *Biot*.

## Prject launch 

The first you want launch the project with node.js, 
run the following commands

1. npm install cross-env @babel/cli @babel/core @babel/preset-env @babel/preset-typescript rimraf typescript --save
2. npm install @types/node --save-dev
3. npm i

Then you can run :
- `npm run clean` to remove the dist folder
- `npm run typecheck` to check statically if there are some typing errors
- `npm run build` to clean and compile *ts* files in *js*
- `npm run start` to run the Main.js file (if you want to run a specific file, launch the command `node ./dist/[the_js_you_want]`)

## Author 
Fissore Davide



## Supervisors
Mme Cinzia Di Giusto et Mr Etienne Lozes

## References
<a id="1"> [1] </a>
https://people.eecs.berkeley.edu/~dawnsong/teaching/s10/papers/angluin87.pdf   
<a id="2"> [2] </a>
https://www.labri.fr/perso/anca/Games/Bib/angluin-nfa-bollig.pdf
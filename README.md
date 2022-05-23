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

## How to use it 

$L^*$ and $NL^*$ are two learning algorithms which can understand an unknown regular language $U$ via membership and equivalence queries.

Their implementation is available at [This Link](https://fissored.github.io/TER-M1-S2/) where you can enter your regular expression and pass it to the Learners.

### Some useful command
If you want to modify or reuse the typescript file, you need to launch `npm install` to download all required dependencies.

Then you can run :
- `npm run clean` to remove the dist folder (dist folder is where ts compiled files are)
- `npm run typecheck` to check statically if there are some typing errors
- `npm run compile` to compile *ts* files in *js* and put them in *dist* folder
- `npm run compilew` same as before command but in watch mode (useful if you have to compile frequently the source files).

## Compare L* and NL*
To compare these two algorithms, you can launch the command 

- `npm run worstDFA` to compare them on regex of style (a+b)*a(a+b)^n;
- `npm run worstRFSA` to compare them on a recursive definition of a regular language where the *cRFSA* as the same number of state of the *mDFA*;
- `npm run benchmark` to compare them on random regex taken from [this link](https://fissored.github.io/TER-M1-S2/)

After testing, you can see the corresponding csv file in the statistic folder and you can plot them with a mini-python program : command = `npm run plotter`

The resulting plots will be drawn in the *statistics/plots* folder. 

## Author 
Fissore Davide

## Supervisors
Mme Cinzia Di Giusto et Mr Etienne Lozes

## References
<a id="1"> [1] </a>
https://people.eecs.berkeley.edu/~dawnsong/teaching/s10/papers/angluin87.pdf   
<a id="2"> [2] </a>
https://www.labri.fr/perso/anca/Games/Bib/angluin-nfa-bollig.pdf
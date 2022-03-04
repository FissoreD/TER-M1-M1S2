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

### In the console
The first time you want launch the project with node.js, 
run the following commands `npm install` to download
all needed dependencies

Then you can run :
- `npm run clean` to remove the dist folder (dist folder is the folder where ts files are compiled in js)
- `npm run typecheck` to check statically if there are some typing errors
- `npm run build` to clean and compile *ts* files in *js*
- `npm run lstar` to run the L* algorithm in the console

### In the HTML page
The project can also be opened in the browser thanks the *index.html* file. 

The html page works only if *ts* files have been compiled. By default, you don't need to compile them, since compiled files are already pushed in the GitHub repository.

However if you modify some *ts* files and want to see the changes in the html page, you can run the command `tsc` and once finished, you can reload the page in the browser.

*Remark*: if you run the `tsc` command with the flag `-w` the typescript compiler will run in background waiting for any modification of a *ts* file, in this case, it will automatically perform the compilation.

## Author 
Fissore Davide

## Supervisors
Mme Cinzia Di Giusto et Mr Etienne Lozes

## References
<a id="1"> [1] </a>
https://people.eecs.berkeley.edu/~dawnsong/teaching/s10/papers/angluin87.pdf   
<a id="2"> [2] </a>
https://www.labri.fr/perso/anca/Games/Bib/angluin-nfa-bollig.pdf
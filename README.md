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
- `npm run clean` to remove the dist folder (dist folder is where ts files are compiled in js)
- `npm run typecheck` to check statically if there are some typing errors
- `npm run build` to clean and compile *ts* files in *js*
- `npm run compile` to compile *ts* files in *js* and put them in *dist* folder
- `npm run compilew` same as before command but in watch mode.

### In the HTML page
The project can be opened in the browser thanks the *index.html* file. 

The html page works only if *ts* from *src* folder are compiled in *dist- folder (command ). By default, you don't need to compile them, since compiled files are already pushed in the GitHub repository.

If you make changes in *ts* files, you must recompile them to see modification in the *html* page.  
To run the *index.html* in browser, you should launch a local server from the project.  
Suggestion : if you use VSCode, you can install the extension [*Live Server*](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).

## Compare L* and NL*
To compare these two algorithms, you can launch the command 
- `npm run wrostDFA` to compare them on regex of style (a+b)*a(a+b)^n
- `npm run compare` to compare them on random regex

Once you have done this, you can see the corresponding csv file in the statistic
folder, you can plot this csv thanks to a mini-python program that can be run with the 
command : `py statistics\pythonPlotter\csvToPlot.py`

The resulting plots will be drawn in the *statistics/plots* folder.  
(Depending on your machine, the *npm* commands that generates the *csv* may be slow, this is because of operation of determinisation and comparaison of automata, in this case you can interrupt the process with *CTRL-C* -> csv files will contain rows up to where the program arrived to write)

## Author 
Fissore Davide

## Supervisors
Mme Cinzia Di Giusto et Mr Etienne Lozes

## References
<a id="1"> [1] </a>
https://people.eecs.berkeley.edu/~dawnsong/teaching/s10/papers/angluin87.pdf   
<a id="2"> [2] </a>
https://www.labri.fr/perso/anca/Games/Bib/angluin-nfa-bollig.pdf
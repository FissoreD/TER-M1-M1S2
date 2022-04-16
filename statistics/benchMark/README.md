## About this folder
This folder contains files representing an encoding of automata. 
They have been taken from ___ and are used to evualate the performances  
of L* and NL* algorithms.  
The result of this evaluation is stored in *benchMark.csv* and the   
corresponding plots are stored in *benchMark* folder.  

## Automaton encoding
A file of this folder should be interpreted as follow:

```
[i0]
[i1]
...
[in]
a0,[qi]->[qj]
...
an,[ql]->[qm]
[f0]
[f1]
...
[fn]
```
1. The first lines of the form $[i_k]$ represent the initial states;
2. The second set of lines on the form $x,[q_i] \rightarrow [q_j]$ are for transitions, where $x$ is the label on the edge going from state $q_i$ to state $q_j$;
3. The last lines on the form $[f_i]$ indicates the final states.

## How to run these files with L* and NL*
These files can be parsed and interpreted to be run with L* and NL* algorithms thanks to the *CompareBenchMark.ts* file in *test_nodejs* folder.  
To automatically run the analyse, you can run the command *npm run benchmark* (if you have compiled all source files with *npm run compile*).
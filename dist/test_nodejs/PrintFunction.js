import{LearnerBase}from"../learners/LearnerBase.js";import{strict}from"assert";import{appendFileSync,writeFileSync}from"fs";export let printInfo=(algo,algoName)=>{return`${algoName} : queries = ${algo.member_number}, equiv = ${algo.equiv_number}, states = ${algo.automaton?.state_number()}, transitions = ${algo.automaton?.transition_number()}, closedness pb = ${algo.closedness_counter}, consistence pb = ${algo.consistence_counter}`};export let printCsvCompare=(L,NL)=>{strict(L.teacher==NL.teacher);let printProperty=propery=>`${(propery.call(L),propery.call(NL))}`;return`${L.teacher.regex},${L.teacher.alphabet.length},${L.teacher.description.split(",")[0]},${printProperty(LearnerBase.prototype.get_member_number)},${printProperty(LearnerBase.prototype.get_equiv_number)},${printProperty(LearnerBase.prototype.automaton.state_number)},${printProperty(LearnerBase.prototype.automaton.transition_number)}`};export let csvHead="Regex,Length alphabet,Description,L Membership queries,NL Membership queries,L Equivalence queries,NL Equivalence queries,L State nb in A,NL State nb in A,L Transition nb in A,NL Transition nb in A";let fileNameToCsv=fileName=>"./statistics/"+fileName+".csv";export let clearFile=fileName=>writeFileSync(fileNameToCsv(fileName),"");export let writeToFile=(fileName,content)=>{appendFileSync(fileNameToCsv(fileName),content+"\n")};
//# sourceMappingURL=PrintFunction.js.map
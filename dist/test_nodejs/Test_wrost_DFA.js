import{clearFile,csvHead,printCsvCompare,writeToFile}from"./PrintFunction.js";import{L_star}from"../lerners/L_star.js";import{NL_star}from"../lerners/NL_star.js";import{TeacherNoAutomaton}from"../teacher/TeacherNoAutomaton.js";let fileName="wrostDFA";clearFile(fileName);writeToFile(fileName,csvHead);let regexList=[];for(let i=0;i<100;i++){let counter_exemples=[];for(let j=Math.max(0,i-3);j<=i+3;j++){counter_exemples.push("a".repeat(j));counter_exemples.push("a".repeat(j)+"b");counter_exemples.push("a".repeat(j)+"b"+"a".repeat(i));counter_exemples.push("a".repeat(j)+"b"+"b".repeat(i));counter_exemples.push("a".repeat(j)+"a"+"b".repeat(i))}counter_exemples.push("bbbbbbbbbbbbbbbabbbbbab");regexList.push(["(a|b)*a"+"(a|b)".repeat(i),counter_exemples])}let printInfo=(algo,algoName)=>{return`${algoName} : queries = ${algo.member_number}, equiv = ${algo.equiv_number}, states = ${algo.automaton?.state_number()}, transitions = ${algo.automaton?.transition_number()}`};for(const[regex,counter_exemples]of regexList){let teacher=new TeacherNoAutomaton({alphabet:"ab",regex:regex,counter_exemples:counter_exemples});let L=new L_star(teacher);let NL=new NL_star(teacher);console.log("==============================");console.log("Current regexp : ",regex);L.make_all_queries();console.log(printInfo(L,"L*"));NL.make_all_queries();console.log(printInfo(NL,"NL*"));writeToFile(fileName,printCsvCompare(L,NL))}
//# sourceMappingURL=Test_wrost_DFA.js.map
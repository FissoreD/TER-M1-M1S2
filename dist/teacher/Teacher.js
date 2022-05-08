import{Automaton}from"../automaton/Automaton.js";import{TeacherAutomaton}from"./TeacherAutomaton.js";import{TeacherNoAutomaton}from"./TeacherNoAutomaton.js";import{allStringFromAlphabet}from"../tools/Utilities.js";import{TeacherTakingAut}from"./TeacherTakingAut.js";export let teacher_a_or_baStar=new TeacherAutomaton("a+(ba)*");export let teacherPairZeroAndOne=new TeacherAutomaton("(00+11+(01+10)(00+11)*(01+10))*",`Automaton accepting L = {w in (0, 1)* | #(w_0) % 2 = 0 and #(w_1) % 2 = 0} <br/> → words with even nb of '0' and even nb of '1'`);export let teacherA3fromLast=new TeacherAutomaton("(a+b)*a(a+b)(a+b)",`Automaton accepting L = {w in (a, b)* | w[-3] = a} <br/>
    → words with an 'a' in the 3rd pos from end`);export let teacherEvenAandThreeB=new TeacherAutomaton("b*a(b+ab*a)*+(a+b)*ba*ba*b(a+b)*",`Automaton accepting L = {w in (a, b)* | #(w_b) ≥ 3 or #(w_a) % 2 = 1}
  <br/> → words with at least 3 'b' or an odd nb of 'a'`);export let teacherNotAfourthPos=new TeacherAutomaton("((a+b)(a+b)(a+b)b)*(a+b+$)(a+b+$)(a+b+$)",`Automaton accepting L = {w ∈ (a,b)* and i ∈ 4ℕ | w[i] ≠ a and i ≤ len(w)} <br/>
  → words without an 'a' in a position multiple of 4`);export let teacher_bStar_a_or_aStart_bStar=new TeacherNoAutomaton({alphabet:"ab",regex:"((bb*a)|(a*b*))",counter_examples:["bba","b","aabb","aba","aa","bbaa"]},`Automaton accepting L = regex((bb^*a) + (a^*b^*))`);export let teacher_b_bStar_a__b_aOrb_star=new TeacherAutomaton("bb*($+a(b(a+b))*)");export let binaryAddition=new TeacherNoAutomaton({alphabet:"012345678",regex:sentence=>{let charToBin=char=>(parseInt(char)>>>0).toString(2).padStart(3,"0");let sentenceAr=Array.from(sentence).map(e=>charToBin(e));let fst_term=parseInt(sentenceAr.map(e=>e[0]).join(""),2);let snd_term=parseInt(sentenceAr.map(e=>e[1]).join(""),2);let trd_term=parseInt(sentenceAr.map(e=>e[2]).join(""),2);return fst_term+snd_term==trd_term},counter_examples:allStringFromAlphabet({alphabet:"012345678",maxLength:3})},`  <pre>
       /**
       *  Automaton calculating addition between binary integers: 
       * exemple : 
       * 0101 + 
       * 1001 =
       * 1110
       * is a valid exemple that can be sent to the automaton with the encoding 3516
       * 3 = 011 (the 1st col), 5 = 101 (the 2nd col), 
       * 1 = 001 (the 3rd col), 6 = 110 (the 4th col) 
       **/</pre> `);let t1=new TeacherTakingAut({automaton:Automaton.strToAutomaton(`
[0]
a0,[14]->[14]
a0,[14]->[13]
a0,[14]->[10]
a0,[13]->[6]
a0,[13]->[0]
a1,[13]->[9]
a1,[13]->[8]
a1,[13]->[3]
a0,[12]->[1]
a1,[12]->[0]
a0,[11]->[2]
a1,[11]->[14]
a1,[11]->[12]
a1,[11]->[1]
a0,[10]->[5]
a0,[10]->[1]
a1,[10]->[12]
a1,[10]->[3]
a1,[9]->[9]
a1,[9]->[0]
a0,[8]->[3]
a1,[8]->[9]
a1,[7]->[11]
a1,[7]->[3]
a0,[6]->[12]
a0,[6]->[10]
a0,[6]->[9]
a1,[6]->[11]
a1,[6]->[0]
a0,[5]->[9]
a0,[5]->[6]
a0,[5]->[2]
a1,[5]->[10]
a1,[4]->[7]
a0,[3]->[10]
a0,[3]->[9]
a0,[3]->[8]
a1,[3]->[3]
a1,[2]->[4]
a0,[1]->[7]
a0,[1]->[3]
a1,[1]->[11]
a1,[1]->[1]
a0,[0]->[12]
a0,[0]->[1]
a1,[0]->[2]
[9]
[6]
[4]
[1]
[0]


`)});export let teachers=[t1,teacher_a_or_baStar,teacher_b_bStar_a__b_aOrb_star,binaryAddition,teacherA3fromLast,teacherEvenAandThreeB,teacherNotAfourthPos,teacherPairZeroAndOne,teacher_bStar_a_or_aStart_bStar];
//# sourceMappingURL=Teacher.js.map
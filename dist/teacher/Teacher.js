import{MyAutomatonToHis}from"../automaton/automaton_type.js";import{minimizeAutomaton}from"../automaton/automaton_type.js";import{Automaton,State}from"../automaton/Automaton.js";import{TeacherAutomaton}from"./TeacherAutomaton.js";import{TeacherNoAutomaton}from"./TeacherNoAutomaton.js";import{TeacherTakingAut}from"./TeacherTakingAut.js";export let teacher_a_or_baStar=new TeacherAutomaton("a+(ba)*");export let teacherPairZeroAndOne=new TeacherAutomaton("(00+11+(01+10)(00+11)*(01+10))*",`Automaton accepting \\(L = \\{w \\in (0, 1)^* | \\#(w_0) \\% 2 = 0 \\land \\#(w_1) \\% 2 = 0\\}\\) <br/> → words with even nb of '0' and even nb of '1'`);export let teacherA3fromLast=new TeacherAutomaton("(a+b)*a(a+b)(a+b)",`Automaton accepting \\(L = \\{w \\in (a, b)^* | w[-3] = a\\}\\) <br/>
    → words with an 'a' in the 3rd pos from end`);export let teacherEvenAandThreeB=new TeacherAutomaton("b*a(b+ab*a)*+(a+b)*ba*ba*b(a+b)*",`Automaton accepting \\(L = \\{w \\in (a, b)^* | \\#(w_b) \\geq 3 \\lor \\#(w_a) \\% 2 = 1\\}\\)
  <br/> → words with at least 3 'b' or an odd nb of 'a'`);export let teacherNotAfourthPos=new TeacherAutomaton("((a+b)(a+b)(a+b)b)*(a+b+$)(a+b+$)(a+b+$)",`Automaton accepting \\(L = \\{w \\in (a,b)^* \\land i \\in 4\\mathbb{N} | w[i] \\neq a \\land i \\leq len(w)\\}\\) <br/>
  → words without an 'a' in a position multiple of 4`);export let teacher_bStar_a_or_aStart_bStar=new TeacherNoAutomaton({alphabet:"ab",regex:"((bb*a)|(a*b*))",counter_exemples:["bba","b","aabb","aba","aa","bbaa"]},`Automaton accepting \\(L = regex((bb^*a) + (a^*b^*))\\)`);export let teacher_b_bStar_a__b_aOrb_star=new TeacherAutomaton("bb*($+a(b(a+b))*)");export let binaryAddition=new TeacherNoAutomaton({alphabet:"012345678",regex:sentence=>{let charToBin=char=>(parseInt(char)>>>0).toString(2).padStart(3,"0");let sentenceAr=Array.from(sentence).map(e=>charToBin(e));let fst_term=parseInt(sentenceAr.map(e=>e[0]).join(""),2);let snd_term=parseInt(sentenceAr.map(e=>e[1]).join(""),2);let trd_term=parseInt(sentenceAr.map(e=>e[2]).join(""),2);return fst_term+snd_term==trd_term},counter_exemples:[]},`Automaton accepting the sum between binary words, exemple : <br>
  <pre>
  0101 + 
  1001 = 
  1110 </pre>
  we encode this sum as the concatenation of vectors of size 3 : <br>
  <pre>
  fst column 011 = 3
  snd column 101 = 5 
  trd column 001 = 1 
  fth column 110 = 6 </pre>
  so 3516 which is a valid word for the sum <br>
  <input class="sum-calc sum-calc-style" onkeyup="update_input()"> + <br>
  <input class="sum-calc sum-calc-style" onkeyup="update_input()"> = <br>
  <input class="sum-calc sum-calc-style" onkeyup="update_input()"><br>
  <button id="calc" onclick="send_calc_button()">Send</button>
  <span class="sum-calc-style" id="add-res"></span>
  `);let automatonList=[];for(let n=4;n<10;n++){let states=new Array(n).fill(0).map((_,i)=>new State(i+"",i==0,i<n/2,["a","b"]));for(let i=0;i<n-1;i++)states[i].addTransition("a",states[i+1]);states[n-1].addTransition("a",states[0]);states[0].addTransition("b",states[0]);for(let i=2;i<n;i++)states[i].addTransition("b",states[i-1]);states[1].addTransition("b",states[n-1]);automatonList.push(minimizeAutomaton(MyAutomatonToHis(new Automaton(new Set(states)))))}let badForNl=new TeacherTakingAut(automatonList[0]);export let teachers=[badForNl,teacher_a_or_baStar,teacher_b_bStar_a__b_aOrb_star,binaryAddition,teacherA3fromLast,teacherEvenAandThreeB,teacherNotAfourthPos,teacherPairZeroAndOne,teacher_bStar_a_or_aStart_bStar];
//# sourceMappingURL=Teacher.js.map
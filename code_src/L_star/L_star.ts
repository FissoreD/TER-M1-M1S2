import { MyString } from "MyString";
import { Observation_table } from "L_star/Observation_table";
import { Teacher } from "Teacher";

export class L_star {
  private alphabet: string[];
  private E: MyString[];
  private S: MyString[];
  private SA: MyString[];
  private observation_table: Observation_table;
  private teacher: Teacher;

  constructor(alphabet: string[], teacher: Teacher) {
    this.alphabet = alphabet;
    this.teacher = teacher;
    this.E = [];
    this.S = [];
    this.SA = [];
    this.observation_table = new Observation_table();
  }

  update_observation_table(x: string, y: string, bool: boolean) {
    this.observation_table.set_value(x, y, bool);
  }

  /**
   * 1. Takes a string in parameter and s in {@link S} and e in {@link E}  
   * 2. Asks to the {@link teacher} if question is accepted  
   * 3. Updates {@link observation_table} wrt the answer
   */
  make_query(question: string, x: string, y: string) {
    var answer = this.teacher.query(question);
    this.update_observation_table(x, y, answer)
  }

  define_next_questions() {
    console.log("In define next question");

    const fst_close_incongruence = this.is_close();
    console.log(fst_close_incongruence.toString());

    // if there is an incongruence := this.close != undefined
    if (fst_close_incongruence) {
      console.log(fst_close_incongruence);
    }
  }


  /**
   * @returns the first sa in SA st it dows not exist s in S st row(s) == row (s.a)
   */
  is_close(): MyString {
    return this.SA.find(t => this.S.some(s =>
      s.is_prefix(t) && this.observation_table.same_row(s.toString(), t.toString())));
  }

  /**
   * @returns if the {@link observation_table} is consistent
   */
  is_consistent(): boolean {
    let same_row = this.observation_table.same_row;
    for (let s1 = 0; s1 < this.S.length; s1++)
      for (let s2 = s1 + 1; s2 < this.S.length; s2++)
        for (const a of this.alphabet) {
          const str1 = this.S[s1].toString();
          const str2 = this.S[s2].toString();
          if (!same_row(str1, str2) || !same_row(str1 + a, str2 + a))
            return false;
        }
    return true;
  }
}
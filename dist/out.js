define("Automaton", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Automaton = void 0;
    class Automaton {
    }
    exports.Automaton = Automaton;
});
define("MyString", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MyString = void 0;
    class MyString extends String {
        constructor(entry) {
            super(entry);
            this.prefix_list = MyString.generate_prefix_list(this.toString());
            this.suffix_list = MyString.generate_suffix_list(this.toString());
        }
        is_prefix(str) {
            return str.substring(0, str.length) == this.toString();
        }
        is_suffix(str) {
            return str.substring(this.length - str.length) == this.toString();
        }
    }
    exports.MyString = MyString;
    MyString.generate_prefix_list = (str) => Array(str.length + 1).fill(0).map((_, i) => str.substring(0, i));
    MyString.generate_suffix_list = (str) => Array(str.length + 1).fill("").map((_, i) => str.substring(i, str.length + 1));
});
define("L_star/Observation_table", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Observation_table = void 0;
    class Observation_table {
        constructor() {
            this.columns = {};
            this.rows = {};
            this.matrix = [[]];
        }
        add_column(column_name) {
            this.columns[column_name] = Object.keys(this.columns).length;
        }
        add_row(row_name) {
            this.rows[row_name] = Object.keys(this.rows).length;
        }
        set_value(row_name, column_name, bool) {
            this.matrix[this.rows[row_name]][this.columns[column_name]] = bool;
        }
        get_value(row_name, column_name) {
            return this.matrix[this.rows[row_name]][this.columns[column_name]];
        }
        get_row(row_name) {
            return this.matrix[this.rows[row_name]];
        }
        same_row(row1, row2) {
            const r1 = this.get_row(row1);
            const r2 = this.get_row(row2);
            return r1 != undefined && r2 != undefined &&
                Observation_table.same_vector(r1, r2);
        }
    }
    exports.Observation_table = Observation_table;
    Observation_table.same_vector = (v1, v2) => v1.map((elt, pos) => elt == v2[pos]).every(e => e);
});
define("Teacher", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Teacher = void 0;
    class Teacher {
        query(sentence) {
            return true;
        }
        member(automaton) {
            return true;
        }
    }
    exports.Teacher = Teacher;
});
define("L_star/L_star", ["require", "exports", "L_star/Observation_table"], function (require, exports, Observation_table_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.L_star = void 0;
    class L_star {
        constructor(alphabet, teacher) {
            this.alphabet = alphabet;
            this.teacher = teacher;
            this.E = [];
            this.S = [];
            this.SA = [];
            this.observation_table = new Observation_table_1.Observation_table();
        }
        update_observation_table(x, y, bool) {
            this.observation_table.set_value(x, y, bool);
        }
        make_query(question, x, y) {
            var answer = this.teacher.query(question);
            this.update_observation_table(x, y, answer);
        }
        define_next_questions() {
            console.log("In define next question");
            const fst_close_incongruence = this.is_close();
            console.log(fst_close_incongruence.toString());
            if (fst_close_incongruence) {
                console.log(fst_close_incongruence);
            }
        }
        is_close() {
            return this.SA.find(t => this.S.some(s => s.is_prefix(t) && this.observation_table.same_row(s.toString(), t.toString())));
        }
        is_consistent() {
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
    exports.L_star = L_star;
});
define("Main", ["require", "exports", "L_star/L_star", "Teacher"], function (require, exports, L_star_1, Teacher_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const L = new L_star_1.L_star(['0', '1'], new Teacher_1.Teacher());
    console.log(123);
    L.define_next_questions();
    console.log(123);
});
//# sourceMappingURL=out.js.map
define(["require", "exports"], function (require, exports) {
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
//# sourceMappingURL=MyString.js.map
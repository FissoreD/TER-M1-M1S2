/**
 * This utilitary class aims
 * return prefix and suffix
 * of a string s
 */
export class MyString extends String {
  private prefix_list: string[];
  private suffix_list: string[];

  constructor(entry: string) {
    super(entry);
    this.prefix_list = MyString.generate_prefix_list(this.toString());
    this.suffix_list = MyString.generate_suffix_list(this.toString());
  }

  /**
   * creates all generate_prefix_list from the str passed in input :
   * exemple for hello : ['', 'h', 'he', 'hel', 'hell', 'hello']
   */
  static generate_prefix_list = (str: string) =>
    Array(str.length + 1).fill(0).map((_, i) => str.substring(0, i));

  /**
   * creates all suffix from the str passed in input :
   * exemple for hello : ['hello', 'ello', 'llo', 'lo', 'o', '']
   */
  static generate_suffix_list = (str: string) =>
    Array(str.length + 1).fill("").map((_, i) => str.substring(i, str.length + 1));

  /** 
   * @returns {boolean} if this is a prefix of str
   */
  is_prefix(str: String): boolean {
    return str.substring(0, str.length) == this.toString();
  }

  /** 
   * @returns {boolean} if str is a suffix of this
   */
  is_suffix(str: String): boolean {
    return str.substring(this.length - str.length) == this.toString();
  }
}
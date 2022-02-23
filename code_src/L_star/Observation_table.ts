export class Observation_table {
  private columns: any;
  private rows: any;
  private matrix: boolean[][];

  constructor() {
    this.columns = {}
    this.rows = {}
    this.matrix = [[]];
  }

  add_column(column_name: string) {
    this.columns[column_name] = Object.keys(this.columns).length;
  }

  add_row(row_name: string) {
    this.rows[row_name] = Object.keys(this.rows).length;
  }

  set_value(row_name: string, column_name: string, bool: boolean) {
    this.matrix[this.rows[row_name]][this.columns[column_name]] = bool;
  }

  /**
   * @returns the value at row_name, column_name of the matrix
   */
  get_value(row_name: string, column_name: string) {
    return this.matrix[this.rows[row_name]][this.columns[column_name]];
  }

  /**
   * @returns the list of boolean of row_name 
   */
  get_row(row_name: string) {
    return this.matrix[this.rows[row_name]];
  }

  /**
   * @return if row1 == row2
   */
  same_row(row1: string, row2: string) {
    const r1 = this.get_row(row1);
    const r2 = this.get_row(row2);
    return r1 != undefined && r2 != undefined &&
      Observation_table.same_vector(r1, r2);
  }

  /**
   * @returns if v1 == v2
   */
  static same_vector = (v1: any[], v2: any[]): boolean => v1.map((elt, pos) => elt == v2[pos]).every(e => e);
}
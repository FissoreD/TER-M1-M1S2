import { same_vector } from "../tools/Utilities.js";

export class Observation_table {
  private columns: string[];
  private rows: string[];
  private matrix: boolean[][];

  constructor() {
    this.columns = []
    this.rows = []
    this.matrix = [[]];
  }

  add_column(column_name: string) {
    this.columns.push(column_name);
  }

  add_row(row_name: string) {
    this.rows.push(row_name);
  }

  set_value(row_name: string, column_name: string, bool: boolean) {
    this.matrix[this.rows.indexOf(row_name)][this.columns.indexOf(column_name)] = bool;
  }

  /**
   * @returns the value at row_name, column_name of the matrix
   */
  get_value(row_name: string, column_name: string) {
    return this.matrix[this.rows.indexOf(row_name)][this.columns.indexOf(column_name)];
  }

  /**
   * @returns the list of boolean of row_name 
   */
  get_row(row_name: string) {
    return this.matrix[this.rows.indexOf(row_name)];
  }

  /**
   * @return if row1 == row2
   */
  same_row(row1: string, row2: string) {
    const r1 = this.get_row(row1);
    const r2 = this.get_row(row2);
    return r1 != undefined && r2 != undefined &&
      same_vector(r1, r2);
  }
}
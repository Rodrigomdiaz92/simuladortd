// Modelo
export class DataTable {
  constructor(df) {
    this.headers = df.columns;
    this.data = df.$data;
  }
}

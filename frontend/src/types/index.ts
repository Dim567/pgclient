export type QueryResult = {
  data?: string[][];
  error?: string;
  timestamp?: number;
}

export type CellData = {
  columnName?: string;
  cellValue?: unknown;
}

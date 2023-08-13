export type RequestData = {
  RequestType: string;
  Data: string[][];
  SuccessMessage: string;
}

export type QueryResult = {
  data?: RequestData;
  error?: string;
  timestamp?: number;
}

export type CellData = {
  columnName?: string;
  cellValue?: unknown;
}

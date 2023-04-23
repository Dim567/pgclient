import { QueryResult } from "../types";

function ResultsWindow (props: QueryResult) {
  const {
    data,
    error,
  } = props;

  if (error) {
    return <div>Request failed.<br/>{error}</div>
  }

  if (!data || !data[0]) { // TODO: check this (remove message on start)
    return <div>Request finished successfully</div>;
  }

  const rowsNumber = data.length;
  const columnsNumber = data[0].length;

  const table = [];

  for (let i = 0; i < columnsNumber; i++) {
    const column = [];
    for (let j = 0; j < rowsNumber; j++) {
      // console.log(data[j][i]);//////////////////////
      const cell = <div className="results-table-cell" key={j}>{data[j][i]}</div>;
      column.push(cell);
    }
    table.push((<div className="results-table-column" key={i}>{column}</div>));
  }

  return (
    <div id="results-window">
      {table}
    </div>
  )
}

export default ResultsWindow;

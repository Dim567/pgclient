import React from "react";
import { ColumnWithStrictAccessor, useBlockLayout, useResizeColumns, useTable } from "react-table";
import Loader from "./Loader";
import { QueryResult } from "../types";

// TODO: need to change @types/react-table package to proper version
// TODO: make sticky header

function ResultsWindow (props: {
  queryRes: QueryResult,
  loading: boolean,
  showCellValue: Function,
}) {
  const {
    queryRes,
    loading,
    showCellValue,
  } = props;

  if (loading) {
    return <Loader type='large' />
  }

  const {
    data: requestData,
    error,
    timestamp,
  } = queryRes;

  if (error) {
    return <div>Request failed.<br/>{error}</div>
  }

  const { RequestType, Data, SuccessMessage } = requestData || {};

  // After start of the application but before query is sent,
  if (!RequestType) {
    return <div>Please execute query</div>;
  }

  if (!Data || !Data[0]) {
    return <div>{SuccessMessage}</div>;
  }

  const rowsNumber = Data.length;
  const columnsNumber = Data[0].length;

  const dataMemo = React.useMemo(
    () => {
      const tableData: Record<string, string>[] = [];
      const columns: Record<string, string>[] = [];

      for (let i = 0; i < columnsNumber; i++) {
        columns.push({
          Header: Data[0][i],
          accessor: `col${i}`,
        });
      }

      for (let i = 1; i < rowsNumber; i++) {
        const rowData: Record<string, string> = {};
        for (let j = 0; j < columnsNumber; j++) {
          const key = columns[j].accessor;
          rowData[key] = Data[i][j];
        }
        tableData.push(rowData);
      }

      return tableData;
    },
    [timestamp]
  );

  const columnsMemo = React.useMemo(
    () => {
      const columns: Record<string, string>[] = [];
      for (let i = 0; i < columnsNumber; i++) {
        columns.push({
          Header: Data[0][i],
          accessor: `col${i}`,
        });
      }
      return columns;
    },
    [timestamp]
  );

  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 30,
      width: 150,
      maxWidth: 1000,
    }),
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    { columns: columnsMemo as ColumnWithStrictAccessor, data: dataMemo, defaultColumn },
    useBlockLayout,
    useResizeColumns,
  );

  return (
    <div className="table-wrapper">
      <div {...getTableProps()} className="table">
        <div>
          {headerGroups.map(headerGroup => (
            <div {...headerGroup.getHeaderGroupProps()} className="tr">
              {headerGroup.headers.map(column => (
                <div {...column.getHeaderProps()} className="th">
                  {column.render('Header')}
                  <div
                    {...(column as any).getResizerProps()}
                    className={`resizer ${
                      (column as any).isResizing ? 'isResizing' : ''
                    }`}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row)
            return (
              <div {...row.getRowProps()} className="tr">
                {row.cells.map(cell => {
                  return (
                    <div
                      {...cell.getCellProps()}
                      className="td clickable"
                      onClick={() => {showCellValue(cell.column.Header, cell.value)}}
                    >
                      {cell.render('Cell')}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}

export default ResultsWindow;

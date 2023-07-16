import { useEffect, useState } from 'react';
import ModalContainer from './ModalContainer';
import { GetTableStructure } from '../../wailsjs/go/main/App';

function TableStructureModal (props: any) {
  const {
    close,
    tableName,
    serverName,
    dbName,
    schemaName,
  } = props;

  const [tableStructure, setTableStructure] = useState<string[][]>();

  useEffect(() => {
    const fetchTableStructure = async (
      serverName: string,
      dbName: string,
      schemaName: string,
      tableName: string,
    )  => {
      try {
        const data = await GetTableStructure(serverName, dbName, schemaName, tableName);
        setTableStructure(data);
      } catch (err) {
        console.log(err);
      }
    }

    fetchTableStructure(serverName, dbName, schemaName, tableName);
  }, [serverName, dbName, schemaName, tableName]);

  let table = null;

  if (tableStructure?.length && tableStructure[0].length) {
    const tableHeader = (
      <tr key="tableHeader">
        {tableStructure[0].map((colName) => (<th key={colName}>{colName}</th>))}
      </tr>
    );

    const tableRows = [];
    for (let i = 1; i < tableStructure.length; i++) {
      const rowKey = 'tableRow-' + i;
      tableRows.push(
        <tr key={rowKey}>
          {tableStructure[i].map((colValue, j) => (<td key={rowKey+':'+j}>{colValue}</td>))}
        </tr>
      );
    }

    table = (
      <table className='modal-content__body_table'>
        <thead className='modal-content__body_table-head'>
          {tableHeader}
        </thead>
        <tbody>
          {tableRows}
        </tbody>
      </table>
    );
  }

  return (
    <ModalContainer
      close={close}
      title={`'${tableName}' table structure`}
    >
      <div className='table-data-structure'>
        {table}
      </div>
    </ModalContainer>
  );
}

export default TableStructureModal;

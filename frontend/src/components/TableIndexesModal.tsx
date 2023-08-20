import { useEffect, useState } from 'react';
import ModalContainer from './ModalContainer';
import { GetTableIndexes } from '../../wailsjs/go/main/App';
import Loader from './Loader';

function TableIndexesModal (props: any) {
  const {
    close,
    tableName,
    serverName,
    dbName,
    schemaName,
  } = props;

  const [tableIndexes, setTableIndexes] = useState<string[][]>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTableKeys = async (
      serverName: string,
      dbName: string,
      schemaName: string,
      tableName: string,
    )  => {
      try {
        setLoading(true);
        const data = await GetTableIndexes(serverName, dbName, schemaName, tableName);
        setTableIndexes(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.log(err);
      }
    }

    fetchTableKeys(serverName, dbName, schemaName, tableName);
  }, [serverName, dbName, schemaName, tableName]);

  let table = null;

  if (tableIndexes?.length && tableIndexes[0].length) {
    const tableHeader = (
      <tr key="tableHeader">
        {tableIndexes[0].map((colName) => (<th key={colName}>{colName}</th>))}
      </tr>
    );

    const tableRows = [];
    for (let i = 1; i < tableIndexes.length; i++) {
      const rowKey = 'tableRow-' + i;
      tableRows.push(
        <tr key={rowKey}>
          {tableIndexes[i].map((colValue, j) => (<td key={rowKey+':'+j}>{colValue}</td>))}
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
      title={`'${tableName}' table keys`}
      modalType="responsive"
    >
      {
        loading ? <Loader type='large' /> :
          <div className='table-data-structure'>
            {table}
          </div>
      }
    </ModalContainer>
  );
}

export default TableIndexesModal;

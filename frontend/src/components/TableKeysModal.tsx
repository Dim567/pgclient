import { useEffect, useState } from 'react';
import ModalContainer from './ModalContainer';
import { GetTableKeys } from '../../wailsjs/go/main/App';
import Loader from './Loader';

function TableKeysModal (props: any) {
  const {
    close,
    tableName,
    serverName,
    dbName,
    schemaName,
    showBackendError,
  } = props;

  const [tableKeys, setTableKeys] = useState<string[][]>();
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
        const data = await GetTableKeys(serverName, dbName, schemaName, tableName);
        setTableKeys(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        showBackendError(err);
      }
    }

    fetchTableKeys(serverName, dbName, schemaName, tableName);
  }, [serverName, dbName, schemaName, tableName]);

  let table = null;

  if (tableKeys?.length && tableKeys[0].length) {
    const tableHeader = (
      <tr key="tableHeader">
        {tableKeys[0].map((colName) => (<th key={colName}>{colName}</th>))}
      </tr>
    );

    const tableRows = [];
    for (let i = 1; i < tableKeys.length; i++) {
      const rowKey = 'tableRow-' + i;
      tableRows.push(
        <tr key={rowKey}>
          {tableKeys[i].map((colValue, j) => (<td key={rowKey+':'+j}>{colValue}</td>))}
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

export default TableKeysModal;

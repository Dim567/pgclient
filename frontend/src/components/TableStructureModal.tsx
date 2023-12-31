import { useEffect, useState } from 'react';
import ModalContainer from './ModalContainer';
import { GetTableStructure } from '../../wailsjs/go/main/App';
import Loader from './Loader';

function TableStructureModal (props: any) {
  const {
    close,
    tableName,
    serverName,
    dbName,
    schemaName,
    showBackendError,
  } = props;

  const [tableStructure, setTableStructure] = useState<string[][]>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTableStructure = async (
      serverName: string,
      dbName: string,
      schemaName: string,
      tableName: string,
    )  => {
      try {
        setLoading(true);
        const data = await GetTableStructure(serverName, dbName, schemaName, tableName);
        setTableStructure(data);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        showBackendError(err);
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
      modalType="responsive"
      close={close}
      title={`'${tableName}' table structure`}
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

export default TableStructureModal;

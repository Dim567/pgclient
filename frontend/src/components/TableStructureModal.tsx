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

  return (
    <ModalContainer
      close={close}
      title={`'${tableName}' table structure`}
    >
      <div>
        {tableStructure}
      </div>
    </ModalContainer>
  );
}

export default TableStructureModal;

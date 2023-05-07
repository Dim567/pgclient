import { useEffect, useState } from 'react';
import DbTable from './DbTable';
import { GetServerDbTables } from '../../wailsjs/go/main/App';

function DbSchema(props: any) {
  const {
    dbName,
    schemaName,
    serverName,
  } = props;
  const [tablesVisible, setTablesVisibility] = useState(false);
  const [dbTables, setTables] = useState<string[]>([]);

  const showTables = async (schemaName: string) => {
    try {
      const tableNames = await GetServerDbTables(serverName, dbName, schemaName);
      setTables(tableNames || []);
    } catch (err) {
      console.log('GOLANG ERROR: ', err)
    }
  }

  useEffect(() => {
    if (tablesVisible) {
      showTables(schemaName);
    }
  }, [tablesVisible])

  const showHideTables = () => {
    setTablesVisibility((tablesVisible) =>!tablesVisible);
  }

  const tables = dbTables.map((table) => <DbTable key={table} name={table}/>)
  return (
    <div className="sidebar-nested-block">
      <div
        className='clickable'
        onClick={() => {
          showHideTables();
        }}
      >
        {schemaName}
      </div>
      <div className="sidebar-nested-block">
        {tablesVisible && <div>Tables</div> }
        {tablesVisible && tables}
      </div>
    </div>
  )
}

export default DbSchema;

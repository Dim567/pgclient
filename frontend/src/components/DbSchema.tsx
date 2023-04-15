import { useEffect, useState } from 'react';
import DbTable from './DbTable';
import { GetServerDbTables } from '../../wailsjs/go/main/App';

function DbSchema(props: any) {
  const {
    dbName,
    dbSchema,
    dbServer,
  } = props;
  const [tablesVisible, setTablesVisibility] = useState(false);
  const [dbTables, setTables] = useState<string[]>([]);

  const showTables = async (dbSchema: string) => {
    try {
      const tableNames = await GetServerDbTables(dbServer, dbName, dbSchema);
      setTables(tableNames || []);
    } catch (err) {
      console.log('GOLANG ERROR: ', err)
    }
  }

  useEffect(() => {
    if (tablesVisible) {
      showTables(dbSchema);
    }
  }, [tablesVisible])

  const showHideTables = () => {
    setTablesVisibility((tablesVisible) =>!tablesVisible);
  }

  const tables = dbTables.map((table) => <DbTable key={table} name={table}/>)
  return (
    <div>
      <div
        onClick={showHideTables}
        className='clickable'
      >{dbSchema}</div>
      {tablesVisible && tables}
    </div>
  )
}

export default DbSchema;

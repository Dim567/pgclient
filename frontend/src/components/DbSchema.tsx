import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState } from 'react';
import DbTable from './DbTable';
import { GetServerDbTables } from '../../wailsjs/go/main/App';
import Loader from './Loader';

function DbSchema(props: any) {
  const {
    dbName,
    schemaName,
    serverName,
    showTableStructure,
    showTableKeys,
    showIndexes,
    setActiveServer,
    setActiveDb,
    setActiveSchema,
    setActiveTable,
    showBackendError,
  } = props;
  const [tablesVisible, setTablesVisibility] = useState(false);
  const [dbTables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const showTables = async (schemaName: string) => {
    try {
      setLoading(true);
      const tableNames = await GetServerDbTables(serverName, dbName, schemaName);
      setTables(tableNames?.sort() || []);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      showBackendError(err);
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

  const tables = dbTables.map((table) => (
    <DbTable
      key={table}
      name={table}
      schemaName={schemaName}
      showStructure={showTableStructure}
      showTableKeys={showTableKeys}
      showIndexes={showIndexes}
      setActiveServer={setActiveServer}
      setActiveDb={setActiveDb}
      setActiveSchema={setActiveSchema}
      setActiveTable={setActiveTable}
    />)
  );
  return (
    <div className="sidebar-nested-block">
      <div
        className='clickable'
        onClick={() => {
          setActiveServer();
          setActiveDb();
          showHideTables();
        }}
      >
        {schemaName}
        { tablesVisible ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </div>
      <div className="sidebar-nested-block">
        { tablesVisible && <div>Tables</div> }
        { tablesVisible && (loading ? <Loader type='small'/> : tables) }
      </div>
    </div>
  )
}

export default DbSchema;

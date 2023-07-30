import CircleIcon from '@mui/icons-material/Circle';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState } from 'react';
import DbSchema from './DbSchema';
import { GetServerDbSchemas } from '../../wailsjs/go/main/App';

type DbProps = {
  name: string;
  dbServer: string;
  isDbActive: boolean;
  activateDb: Function;
  activateServer: Function;
  showTableStructure: Function;
  showTableKeys: Function;
  setActiveSchema: Function,
  setActiveTable: Function,
}

function Db(props: DbProps) {
  const {
    name,
    dbServer,
    isDbActive,
    activateDb,
    activateServer,
    showTableStructure,
    showTableKeys,
    setActiveSchema,
    setActiveTable,
  } = props;

  const [visible, setVisibility] = useState(false);
  const [dbSchemas, setSchemas] = useState<string[]>([]);

  const showSchemas = async (dbName: string) => {
    try {
      const schemaNames = await GetServerDbSchemas(dbServer, dbName);
      setSchemas(schemaNames || []);
    } catch (err) {
      console.log('GOLANG ERROR: ', err)
    }
  }

  useEffect(() => {
    if (visible) {
      showSchemas(name);
    }
  }, [visible])

  const schemas = dbSchemas.map((schema) =>
    <DbSchema
      key={schema}
      schemaName={schema}
      dbName={name}
      serverName={dbServer}
      showTableStructure={showTableStructure}
      showTableKeys={showTableKeys}
      setActiveServer={() => activateServer(dbServer)}
      setActiveDb={() => activateDb(name)}
      setActiveSchema={setActiveSchema}
      setActiveTable={setActiveTable}
    />
  )
  return (
    <div className="sidebar-nested-block">
      <div
        onClick={() => {
          activateDb(name);
          activateServer(dbServer);
          setVisibility((visible) =>!visible);
        }}
        className="clickable"
      >
        <CircleIcon
          fontSize='small'
          htmlColor={isDbActive ? '#04FF04' : 'white'}
        />
        {name}
        { visible ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </div>
      <div className="sidebar-nested-block">
        {visible && <div>Schemas</div>}
        {visible && schemas}
      </div>
    </div>
  )
}

export default Db;

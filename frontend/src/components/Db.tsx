import { useEffect, useState } from 'react';
import DbSchema from './DbSchema';
import { GetServerDbSchemas } from '../../wailsjs/go/main/App';

type DbProps = {
  name: string;
  dbServer: string;
  isDbActive: boolean;
  activateDb: Function;
}

function Db(props: DbProps) {
  const {
    name,
    dbServer,
    // isDbActive, //TODO: move this to parent component
    activateDb,
  } = props;

  const [isDbActive, setActiveDb] = useState(false);
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
    <DbSchema key={schema} schemaName={schema} dbName={name} serverName={dbServer}/>
  )
  return (
    <div className="sidebar-nested-block">
      <div
        onClick={() => {setVisibility((visible) =>!visible);}}
        className="clickable"
      >{name}</div>
      <div className="sidebar-nested-block">
        {visible && <div>Schemas</div>}
        {visible && schemas}
      </div>
    </div>
  )
}

export default Db;

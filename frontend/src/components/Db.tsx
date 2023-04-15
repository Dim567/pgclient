import { useEffect, useState } from 'react';
import DbSchema from './DbSchema';
import { GetServerDbSchemas } from '../../wailsjs/go/main/App';

type DbProps = {
  name: string;
  dbServer: string;
  active: boolean;
  activateDb: Function;
}

function Db(props: DbProps) {
  const {
    name,
    dbServer,
    active,
    activateDb,
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

  const activateCurrentDb = () => {
    setVisibility((visible) =>!visible);
    activateDb(name);
  }

  const schemas = dbSchemas.map((schema) =>
    <DbSchema key={schema} dbSchema={schema} dbName={name} dbServer={dbServer}/>
  )
  return (
    <div>
      <div
        onClick={activateCurrentDb}
        className="clickable"
      >{name}</div>
      {visible && schemas}
    </div>
  )
}

export default Db;

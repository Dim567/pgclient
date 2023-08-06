import SettingsIcon from '@mui/icons-material/Settings';
import CircleIcon from '@mui/icons-material/Circle';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useState } from "react";
import { DbServerProps } from "../interfaces";
import Db from "./Db";

import { GetServerDatabases, DeleteServer } from "../../wailsjs/go/main/App";
import Loader from './Loader';

function DbServer (props: DbServerProps) {
  const {
    name,
    selected, // if true => all queries in query editor run for this server
    // dbNames,
    // connect,
    activeDb,
    setActiveDb,
    setActiveServer,
    setActiveSchema,
    setActiveTable,
    showConnectionSettings,
    showTableStructure,
    showTableKeys,
  } = props;

  const [dbList, setDbList] = useState<string[]>([]);
  const [ dbVisible, setDbVisibility] = useState(false);
  const [loading, setLoading] = useState(false);

  // TODO: prevent connect to already connected server???
  const connect = async () => {
    try {
      setLoading(true);
      const dbNames = await GetServerDatabases(name);
      setDbList(dbNames);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log('Backend error: ', err) // TODO: show error in output
    }
  }

  const deleteServer = async () => {
    try {
      await DeleteServer(name);
      // TODO: activate one of the existing servers if any, after deleting this one
      setActiveServer(`${Date.now()}-fake`);
    } catch (err) {
      console.log('Backend error: ', err)
    }
  }

  const databases =  dbVisible && dbList.map((dbName) => (
    <Db
      key={dbName}
      name={dbName}
      dbServer={name}
      isDbActive={dbName === activeDb ? true : false}
      activateDb={setActiveDb}
      activateServer={setActiveServer} // This is necessary because we may click on other server db while active server is different (chosen another server in the list)
      showTableStructure={showTableStructure}
      showTableKeys={showTableKeys}
      setActiveSchema={setActiveSchema}
      setActiveTable={setActiveTable}
    />
  ));

  return (
    <div className="server sidebar-nested-block">
      <div className="clickable" onClick={() => {
        if (!dbVisible) { connect(); }
        setActiveServer(name);
        setActiveDb('');
        setActiveSchema('');
        setActiveTable('')
        setDbVisibility((dbVisible) => !dbVisible);
      }}>
        <CircleIcon
          fontSize='small'
          htmlColor={selected ? '#04FF04' : 'white'}
        />
        {name}
        {  dbVisible ? <ExpandLessIcon fontSize='small'/> : <ExpandMoreIcon fontSize='small'/> }
        <SettingsIcon
          onClick={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            showConnectionSettings(name);
          }}
          fontSize='small'
        />
        <DeleteForeverIcon
          onClick={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            deleteServer();
          }}
          fontSize='small'
        />
      </div>
      <div className="sidebar-nested-block">
        { dbVisible && <div>Databases</div>}
        { loading ? <Loader type='medium'/> : databases }
      </div>
    </div>
  )
}

export default DbServer;

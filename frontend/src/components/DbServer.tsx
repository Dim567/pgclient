import SettingsIcon from '@mui/icons-material/Settings';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useState } from "react";
import { DbServerProps } from "../interfaces";
import Db from "./Db";

import { GetServerDatabases } from "../../wailsjs/go/main/App";

function DbServer (props: DbServerProps) {
  const {
    name,
    selected, // if true => all queries in query editor run for this server
    // dbNames,
    // connect,
    // activeDb,
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

  // TODO: prevent connect to already connected server???
  const connect = async () => {
    try {
      const dbNames = await GetServerDatabases(name);
      setDbList(dbNames);
    } catch (err) {
      console.log('Backend error: ', err) // TODO: show error in output
    }
  }

  const databases =  dbVisible && dbList.map((dbName) => (
    <Db
      key={dbName}
      name={dbName}
      dbServer={name}
      isDbActive={dbName === /*activeDb*/'fvv' ? true : false}
      activateDb={setActiveDb}
      activateServer={setActiveServer} // This is necessary because we may click on other server db while active server is different (chosen another server in the list)
      showTableStructure={showTableStructure}
      showTableKeys={showTableKeys}
      setActiveSchema={setActiveSchema}
      setActiveTable={setActiveTable}
    />
  ));

  return (
    <div className="server sidebar-nested-block" onClick={() => setActiveServer(name)}>
      <div className="clickable" onClick={() => {
        if (!dbVisible) { connect(); }
        setDbVisibility((dbVisible) => !dbVisible);
      }}>
        {name}
        {  dbVisible ? <ExpandLessIcon fontSize='small'/> : <ExpandMoreIcon fontSize='small'/>}
        <SettingsIcon
          onClick={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            showConnectionSettings(name);
          }}
          fontSize='small'
        />
        <DeleteForeverIcon
          onClick={() => { console.log('item will be deleted') }} // TODO: provide golang method for the deleting
          fontSize='small'
        />
      </div>
      <div className="sidebar-nested-block">
        { dbVisible && <div>Databases</div>}
        {databases}
      </div>
    </div>
  )
}

export default DbServer;

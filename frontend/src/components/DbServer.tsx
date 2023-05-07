import { useState } from "react";
import { DbServerProps } from "../interfaces";
import Db from "./Db";

import { GetServerDatabases } from "../../wailsjs/go/main/App";

function DbServer (props: DbServerProps) {
  const {
    name,
    selected, // if true => all queries in query editor run for this server
    // activeDb,
    // dbNames,
    // connect,
    // activeDb,
    // activateDb,
    setActiveDb,
    setActiveServer,
    showConnectionSettings,
  } = props;

  const [dbList, setDbList] = useState<string[]>([]);
  const [showDatabases, setDbVisibility] = useState(false);

  // TODO: prevent connect to already connected server???
  const connect = async () => {
    try {
      const dbNames = await GetServerDatabases(name);
      setDbList(dbNames);
      setDbVisibility(true);
    } catch (err) {
      console.log('Backend error: ', err) // TODO: show error in output
    }
  }

  const databases = showDatabases && dbList.map((dbName) => (
    <Db
      key={dbName}
      name={dbName}
      dbServer={name}
      isDbActive={dbName === /*activeDb*/'fvv' ? true : false}
      activateDb={setActiveDb}
    />
  ));

  return (
    <div className="server sidebar-nested-block" onClick={() => setActiveServer(name)}>
      <div className="clickable" onClick={() => connect()}>{name}</div>
      <div className="sidebar-nested-block">
        {showDatabases && <div>Databases</div>}
        {databases}
      </div>
      <button className="btn" onClick={() => showConnectionSettings(name)}>ShowConnectionSettings</button>
    </div>
  )
}

export default DbServer;

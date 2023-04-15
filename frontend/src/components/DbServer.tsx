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
  const [showDatabases, setDbVisibility] = useState<boolean>(true);
  const [serverConnected, setConnectionFlag] = useState<boolean>(false);

  // TODO: prevent connect to already connected server???
  const connect = async () => {
    try {
      const dbNames = await GetServerDatabases(name);
      setConnectionFlag(true);
      setDbList(dbNames);
    } catch (err) {
      console.log('Backend error: ', err) // TODO: show error in output
    }
  }

  const showHideDatabases = () => {
    if (serverConnected) {
      setDbVisibility((value) => !value)
    }
  }

  const databases = showDatabases && dbList.map((dbName) => (
    <Db
      key={dbName}
      name={dbName}
      dbServer={name}
      active={dbName === /*activeDb*/'fvv' ? true : false}
      activateDb={setActiveDb}
    />
  ));

  return (
    <div className="server-name" onClick={() => setActiveServer(name)}>
      {name}
      <button className="btn" onClick={() => connect()}>Connect</button>
      <div>{databases}</div>
      <button className="btn" onClick={showHideDatabases}>ShowDatabases</button>
      <button className="btn" onClick={() =>showConnectionSettings(name)}>ShowConnectionSettings</button>
    </div>
  )
}

export default DbServer;

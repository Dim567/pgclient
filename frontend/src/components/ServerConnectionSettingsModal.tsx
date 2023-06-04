import { useEffect, useState } from "react";
import { GetConnectionSettings, PingConnection, SaveConnectionSettings, SetDbServer } from "../../wailsjs/go/main/App";
import ModalContainer from "./ModalContainer";

function ServerConnectionSettingsModal (props: any) {
  const {
    close,
    serverName,
    setActiveServer,
  } = props;

  // TODO: add fields validation (every field must be populated, connection name must be unique)
  const [connectionName, setConnectionName] = useState<string>('');
  const [host, setHost] = useState<string>('');
  const [port, setPort] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [pingStatus, setPingStatus] = useState<string>('');
  const [saveStatus, setSaveStatus] = useState<string>('');

  const updateConnectionName = (e: any) => setConnectionName(e.target.value);
  const updateHost = (e: any) => setHost(e.target.value);
  const updatePort = (e: any) => setPort(e.target.value);
  const updateUserName = (e: any) => setUserName(e.target.value);
  const updatePassword = (e: any) => setPassword(e.target.value);

  useEffect(() => {
    const fetchConnSettings = async () => {
      try {
        if (serverName) {
          const {
            Name,
            Host,
            Port,
            User,
            Password,
          } = await GetConnectionSettings(serverName);

          setConnectionName(Name);
          setHost(Host);
          setPort(Port);
          setUserName(User);
          setPassword(Password);
        }
      } catch (err) {
        console.log(err);
      }
    }

    fetchConnSettings();
  }, []);

  const pingIndicator = pingStatus && <span>{pingStatus}</span>;
  const saveIndicator = saveStatus && <span>{saveStatus}</span>;

  const pingConnection = async () => {
    try {
      // await Connect('localhost', '5432', 'dbclient', 'dbclient');
      await PingConnection(host, port, userName, password)
      setPingStatus('Success')
    } catch (err) {
      setPingStatus('Failure')
    }
  }

  const saveConnectionSettings = async () => {
    try {
      await SaveConnectionSettings(connectionName, host, port, userName, password)
      // If connection with this name already exists =>
      // 1. TODO: cancel running queries
      // 2. Close corresponding connection pool
      // 3. Update connection settings
      // Everythig should be handled by golang backend
      await SetDbServer(connectionName, host, port, userName, password)
      setSaveStatus('Success')
      setActiveServer(connectionName);
    } catch (err) {
      setSaveStatus('Failure') // TODO: add error message somewhere to output
    }
  }

  return (
    <ModalContainer
      close={close}
      title="Server connection settings"
    >
      <div>
        <label htmlFor="connection">Connection name: </label>
        <input id="connection" className="input" onChange={updateConnectionName} autoComplete="off" name="host" type="text" defaultValue={connectionName}/>
      </div>

      <div>
        <label htmlFor="host">Host: </label>
        <input id="host" className="input" onChange={updateHost} autoComplete="off" name="host" type="text" defaultValue={host}/>
      </div>

      <div>
        <label htmlFor="port">Port: </label>
        <input id="port" className="input" onChange={updatePort} autoComplete="off" name="port" type="text" defaultValue={port}/>
      </div>

      <div>
        <label htmlFor="user">User name: </label>
        <input id="user" className="input" onChange={updateUserName} autoComplete="off" name="user" type="text" defaultValue={userName}/>
      </div>

      <div>
        <label htmlFor="password">Password: </label>
        <input id="password" className="input" onChange={updatePassword} autoComplete="off" name="password" type="text" defaultValue={password}/>
      </div>

      <div>
        <button className="btn" onClick={pingConnection}>Ping</button>
        {pingIndicator}
      </div>

      <div>
        <button className="btn" onClick={saveConnectionSettings}>Save</button>
        {saveIndicator}
      </div>
    </ModalContainer>
  );
}

export default ServerConnectionSettingsModal;

import { useEffect, useState } from 'react';

import './App.css';
import ConnectionPopup from './ConnectionPopup';
import DbServer from './DbServer';
import MainWindow from './MainWindow';
import Sidebar from './Sidebar';

import { GetConnectionsNames, InitConnections } from "../../wailsjs/go/main/App";
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';

function App() {
  const [hSizes, setHSizes] = useState([300, 'auto']);
  const layoutCSS = {
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  const [activeDb, setActiveDb] = useState('');
  const [activeServer, setActiveServer] = useState('');

  const [popupVisible, setPopupVisibility] = useState(false);

  const [connNames, setConnNames] = useState<string[]>([]);
  const [connId, setConnId] = useState<string>();

  useEffect(() => {
    const initConnections = async () => {
      try {
        await InitConnections()
      } catch(err) {
        console.log(err);
      }
    };

    initConnections();
  }, []);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const cNames = await GetConnectionsNames(); // TODO: rename to server names
        setConnNames(cNames);
      } catch (err) {
        console.log(err);
      }
    };

    fetchConnections();
  }, [activeServer]);

  const showConnectionSettings = (connName: string) => {
    setConnId(connName);
    setPopupVisibility(true);
  }

  const dbServers = connNames.map((name) => {
    const server = {
      name,
      selected: name === activeServer,
      // activeDb,
      // dbNames,
      // connect,
      // activeDb,
      // activateDb,
      setActiveDb,
      setActiveServer,
      showConnectionSettings,
    }
    return (<DbServer key={name} {...server} />)
  });

  return (
    <div id="app">
      <SplitPane
        split='vertical'
        sizes={hSizes}
        onChange={setHSizes}
        sashRender={()=>null}
      >
        <Pane minSize={300} maxSize='50%'>
          <Sidebar>
            <div
              className='connection-settings-show'
              onClick={() => setPopupVisibility(true)}
            >
              Create connection
            </div>
            {dbServers}
          </Sidebar>
        </Pane>
        <MainWindow
          activeDb={activeDb}
          activeServer={activeServer}
        />
      </SplitPane>
      {
        popupVisible ?
          <ConnectionPopup
            connId={connId}
            close={() => setPopupVisibility(false)}
            setActiveServer={setActiveServer}
          /> : null
      }
    </div>
  )
}

export default App

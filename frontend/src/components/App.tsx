import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import SplitPane, { Pane } from 'split-pane-react';

import 'split-pane-react/esm/themes/default.css';
import './App.css';

import DbServer from './DbServer';
import MainWindow from './MainWindow';
import ServerConnectionSettings from './ServerConnectionSettingsModal';
import Sidebar from './Sidebar';

import { GetConnectionsNames, InitConnections } from "../../wailsjs/go/main/App";
import TableStructureModal from './TableStructureModal';
import TableKeysModal from './TableKeysModal';

const DEFAULT_SIDEBAR_WIDTH = 300;

enum ModalTypeEnum {
  SERVER_CONNECTION_SETTINGS = 'server_connection_settings',
  TABLE_CELL_DATA = 'table_cell_data',
  TABLE_STRUCTURE = 'table_structure',
  TABLE_KEYS = 'table_keys',
  NONE = 'none',
}

function App() {
  const [hSizes, setHSizes] = useState([DEFAULT_SIDEBAR_WIDTH, 'auto']);
  const [activeServer, setActiveServer] = useState('');
  const [activeDb, setActiveDb] = useState('');
  const [activeSchema, setActiveSchema] = useState('');
  const [activeTable, setActiveTable] = useState('');

  const [modalType, setModalType] = useState(ModalTypeEnum.NONE);

  const [connNames, setConnNames] = useState<string[]>([]);

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
    setActiveServer(connName);
    setModalType(ModalTypeEnum.SERVER_CONNECTION_SETTINGS);
  }

  const showTableStructure = () => {
    setModalType(ModalTypeEnum.TABLE_STRUCTURE);
  }

  const showTableKeys = () => {
    setModalType(ModalTypeEnum.TABLE_KEYS);
  }

  const dbServers = connNames.map((name) => {
    const server = {
      name,
      selected: name === activeServer,
      activeDb,
      setActiveDb,
      setActiveServer,
      setActiveSchema,
      setActiveTable,
      showConnectionSettings,
      showTableStructure,
      showTableKeys,
    }
    return (<DbServer key={name} {...server} />)
  });

  const modalWindow = (modalType: ModalTypeEnum) => {
    switch (modalType) {
      case ModalTypeEnum.SERVER_CONNECTION_SETTINGS:
        return (
          <ServerConnectionSettings
            serverName={activeServer}
            close={() => setModalType(ModalTypeEnum.NONE)}
            setActiveServer={setActiveServer}
          />
        );
      case ModalTypeEnum.TABLE_STRUCTURE:
        return (
          <TableStructureModal
            serverName={activeServer}
            dbName={activeDb}
            close={() => setModalType(ModalTypeEnum.NONE)}
            tableName={activeTable}
            schemaName={activeSchema}
          />
        );
      case ModalTypeEnum.TABLE_KEYS:
        return (
          <TableKeysModal
            serverName={activeServer}
            dbName={activeDb}
            close={() => setModalType(ModalTypeEnum.NONE)}
            tableName={activeTable}
            schemaName={activeSchema}
          />
        );
      case ModalTypeEnum.TABLE_CELL_DATA:
        return null; // temporary
      default:
        return null;
    }
  }

  return (
    <div id="app">
      <SplitPane
        split='vertical'
        sizes={hSizes}
        onChange={setHSizes}
        sashRender={()=>null}
      >
        <Pane minSize={100} maxSize='50%'>
          <Sidebar>
            <div
              className='connection-settings-show'
              onClick={() => {
                setActiveServer('');
                setModalType(ModalTypeEnum.SERVER_CONNECTION_SETTINGS);
              }}
            >
              Create server connection <AddIcon />
            </div>
            <div className='server sidebar-nested-block'>
              Db servers
              {dbServers}
            </div>
          </Sidebar>
        </Pane>
        <MainWindow
          activeDb={activeDb}
          activeServer={activeServer}
        />
      </SplitPane>
      {modalWindow(modalType)}
    </div>
  )
}

export default App;

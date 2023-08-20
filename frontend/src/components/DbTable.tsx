import SettingsIcon from '@mui/icons-material/Settings';
import KeyIcon from '@mui/icons-material/Key';
import StorageIcon from '@mui/icons-material/Storage';

function DbTable(props: any) {
  const {
    name,
    showStructure,
    showTableKeys,
    showIndexes,
    setActiveServer,
    setActiveDb,
    setActiveSchema,
    setActiveTable,
    schemaName,
  } = props;

  return (
    <div
      className="sidebar-nested-block clickable"
      onClick={() => {
        setActiveServer();
        setActiveDb();
        setActiveSchema(schemaName);
        setActiveTable(name);
      }}
    >
      {name}
      <SettingsIcon onClick={() => {
        showStructure();
      }}/>
      <KeyIcon onClick={() => {
        showTableKeys();
      }}/>
      <StorageIcon onClick={() => {
        showIndexes();
      }}/>
    </div>
  );
}

export default DbTable;

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
      <SettingsIcon
        titleAccess='table structure'
        onClick={() => { showStructure(); }}
      />
      <KeyIcon
        titleAccess='table keys'
        onClick={() => { showTableKeys(); }}
      />
      <StorageIcon
        titleAccess='table indexes'
        onClick={() => { showIndexes(); }}
      />
    </div>
  );
}

export default DbTable;

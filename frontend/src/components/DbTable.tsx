import SettingsIcon from '@mui/icons-material/Settings';
import KeyIcon from '@mui/icons-material/Key';

function DbTable(props: any) {
  const {
    name,
    showStructure,
    showTableKeys,
    setActiveServer,
    setActiveDb,
    setActiveSchema,
    setActiveTable,
    schemaName,
  } = props;

  return (
    <div
      className="db-table sidebar-nested-block"
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
    </div>
  );
}

export default DbTable;

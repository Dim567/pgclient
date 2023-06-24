import SettingsIcon from '@mui/icons-material/Settings';
import KeyIcon from '@mui/icons-material/Key';

function DbTable(props: any) {
  const {
    name,
    showStructure,
    showTableKeys,
    setActiveSchema,
    setActiveTable,
    schemaName,
  } = props;

  return (
    <div
      className="db-table sidebar-nested-block"
      // onClick={() => {
      //   setActiveSchema(schemaName);
      //   setActiveTable(name);
      //   showStructure();
      // }}
    >
      {name}
      <SettingsIcon onClick={() => {
        setActiveSchema(schemaName);
        setActiveTable(name);
        showStructure();
      }}/>
      <KeyIcon onClick={() => {
        setActiveSchema(schemaName);
        setActiveTable(name);
        showTableKeys();
      }}/>
    </div>
  );
}

export default DbTable;

function DbTable(props: any) {
  const {
    name,
    showStructure,
    setActiveSchema,
    setActiveTable,
    schemaName,
  } = props;

  return (
    <div
      className="db-table sidebar-nested-block"
      onClick={() => {
        setActiveSchema(schemaName);
        setActiveTable(name);
        showStructure();
      }}
    >{name}</div>
  );
}

export default DbTable;

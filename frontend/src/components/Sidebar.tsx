// TODO: add proper type
function Sidebar(props: any) {
  const { children } = props;
  return (
    <div id="sidebar">
      {children}
    </div>
  )
}

export default Sidebar;

import { useState } from "react";

type QueryWindowProps = {
  db: string;
  server: string;
  runQuery: Function;
}

function QueryWindow (props: QueryWindowProps) {
  const {
    db,
    server,
    runQuery
  } = props;

  const [query, setQuery] = useState("");

  const updateQuery = (e: any) => setQuery(e.target.value);

  return (
    <div id="query-window">
      <div id="query-handlers-bar">
        <button className="btn" onClick={() => runQuery(server, db, query)}>Execute query</button>
      </div>
      <div id="query-area">
        <textarea
          id="query-input"
          name="query"
          rows={10}
          cols={50}
          value={query}
          onChange={e => updateQuery(e)}
        ></textarea>
      </div>
    </div>
  )
}

export default QueryWindow;

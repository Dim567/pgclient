import { useState } from "react";
import { QueryResult } from "../types";
import QueryWindow from "./QueryWindow";
import ResultsWindow from "./ResultsWindow";

import { ExecuteQuery } from "../../wailsjs/go/main/App";

type MainWindowProps = {
  // runQuery: Function;
  activeDb: string;
  activeServer: string;
  // queryRes?: QueryResult;
}

function MainWindow (props: MainWindowProps) {
  const {
    // runQuery,
    // queryRes,
    activeDb,
    activeServer,
  } = props;

  const [queryRes, setQueryRes] = useState<QueryResult>();

  const executeQuery = async (server: string, db: string, query: string) => {
    try {
      const data = await ExecuteQuery(server, db, query);
      setQueryRes({ data });
    } catch (err) {
      setQueryRes({ error: err as string })
    }
  }

  return (
    <div id="main-window">
      <QueryWindow
        db={activeDb}
        server={activeServer}
        runQuery={executeQuery}
      />
      {
        queryRes ?
          <ResultsWindow
            data={queryRes.data}
            error={queryRes.error}
          /> : null
      }
    </div>
  )
}

export default MainWindow;

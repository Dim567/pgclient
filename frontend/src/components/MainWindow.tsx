import { useState } from "react";
import { QueryResult } from "../types";
import QueryWindow from "./QueryWindow";
import ResultsWindow from "./ResultsWindow";

import { ExecuteQuery } from "../../wailsjs/go/main/App";
import SplitPane, { Pane } from "split-pane-react";

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

  const [vSizes, setVSizes] = useState([
    '50%' as unknown as number,
    'auto'
  ]);
  const [queryRes, setQueryRes] = useState<QueryResult>({});

  const executeQuery = async (server: string, db: string, query: string) => {
    try {
      const data = await ExecuteQuery(server, db, query);
      const timestamp = Date.now();
      setQueryRes({ data, timestamp });
    } catch (err) {
      setQueryRes({ error: err as string })
    }
  }

  return (
    <div id="main-window">
      <SplitPane
        split='horizontal'
        sizes={vSizes}
        onChange={setVSizes}
        sashRender={()=>null}
      >
        <Pane minSize={100}>
          <QueryWindow
            db={activeDb}
            server={activeServer}
            runQuery={executeQuery}
          />
        </Pane>
        <Pane minSize={100}>
          <ResultsWindow
            data={queryRes.data}
            error={queryRes.error}
            timestamp={queryRes.timestamp}
          />
        </Pane>
      </SplitPane>
    </div>
  )
}

export default MainWindow;

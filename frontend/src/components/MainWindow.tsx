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
  showCellValue: Function;
  // queryRes?: QueryResult;
}

function MainWindow (props: MainWindowProps) {
  const {
    // runQuery,
    // queryRes,
    activeDb,
    activeServer,
    showCellValue,
  } = props;

  const [vSizes, setVSizes] = useState([
    '50%' as unknown as number,
    'auto'
  ]);
  const [queryRes, setQueryRes] = useState<QueryResult>({});
  const [loading, setLoading] = useState(false);

  const executeQuery = async (server: string, db: string, query: string) => {
    try {
      setLoading(true);
      const data = await ExecuteQuery(server, db, query);
      // TODO: add methods for deleting database, transactions, ...
      const timestamp = Date.now();
      setQueryRes({ data, timestamp });
      setLoading(false);
    } catch (err) {
      const errorMessage = typeof err === 'string' ? err : (err as any).message;
      setQueryRes({ error: errorMessage });
      setLoading(false);
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
        <Pane className="results-window-pane" minSize={100}>
          <ResultsWindow
            queryRes={queryRes}
            loading={loading}
            showCellValue={showCellValue}
          />
        </Pane>
      </SplitPane>
    </div>
  )
}

export default MainWindow;

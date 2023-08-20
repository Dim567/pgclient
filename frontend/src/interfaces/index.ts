
export interface DbServerProps {
  name: string;
  selected: boolean;
  activeDb: string;
  setActiveDb: Function;
  setActiveServer: Function;
  setActiveSchema: Function,
  setActiveTable: Function,
  showConnectionSettings: Function;
  showTableStructure: Function;
  showTableKeys: Function;
  showIndexes: Function;
  showBackendError: Function;
}


export interface DbServerProps {
  name: string;
  selected: boolean;
  // dbNames: string[];
  // connect: Function;
  // activeDb: string;
  // activateDb: Function;
  setActiveDb: Function;
  setActiveServer: Function;
  setActiveSchema: Function,
  setActiveTable: Function,
  showConnectionSettings: Function;
  showTableStructure: Function;
}

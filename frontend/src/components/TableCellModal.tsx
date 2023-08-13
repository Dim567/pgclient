import ModalContainer from "./ModalContainer";

function TableCellModal (props: any) {
  const {
    columnName,
    value,
    close,
  } = props;

  return (
    <ModalContainer
      modalType="responsive"
      close={close}
      title={`${columnName}`}
    >
      <div className='table-cell-data'>
        {value}
      </div>
    </ModalContainer>
  );
}

export default TableCellModal;

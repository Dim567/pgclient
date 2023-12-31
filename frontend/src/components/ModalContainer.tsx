import CloseIcon from '@mui/icons-material/Close';

function ModalContainer (props: any) {
  const {
    children,
    close,
    title,
    modalType,
  } = props;

  return (
    <div className="modal-container">
      <div className="modal-container__background"/>
      {/* CONTENT */}
      <div className={modalType === "responsive" ? "modal-content-responsive" : "modal-content"}>
        {/* HEADER */}
        <div className="modal-content__header">
          <div className="modal-content__title">
            {title}
          </div>
          <div
            className="modal-content__close-button clickable"
            onClick={close}
          >
            <CloseIcon />
          </div>
        </div>
        {/* BODY */}
        <div className="modal-content__body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default ModalContainer;

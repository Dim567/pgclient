function ModalContainer (props: any) {
  const {
    children,
    close,
    title,
  } = props;

  return (
    <div className="modal-container">
      <div className="modal-container__background"/>
      {/* CONTENT */}
      <div className="modal-content">
        {/* HEADER */}
        <div className="modal-content__header">
          <div className="modal-content__title">
            {title}
          </div>
          <div
            className="modal-content__close-button"
            onClick={close}
          >X</div>
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

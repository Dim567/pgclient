function ModalContainer (props: any) {
  const {
    children,
    close,
    title,
  } = props;
  return (
    <div className="popup-container">
      <div className="popup-container__background"/>
      {/* CONTENT */}
      <div className="popup-content">
        {/* HEADER */}
        <div className="popup-content__header">
          <div className="popup-content__title">
            {title}
          </div>
          <div
            className="popup-content__close-button"
            onClick={close}
          >X</div>
        </div>
        {/* BODY */}
        <div className="popup-content__body">
          {children}
        </div>
      </div>
    </div>
  );
}

export default ModalContainer;

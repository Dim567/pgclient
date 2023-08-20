import ModalContainer from './ModalContainer';

function BackendErrorModal (props: any) {
  const {
    close,
    error,
  } = props;

  return (
    <ModalContainer
      close={close}
      title={`Backend error`}
      modalType="responsive"
    >
      <div>{error}</div>
    </ModalContainer>
  );
}

export default BackendErrorModal;

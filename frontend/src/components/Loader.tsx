import AutorenewIcon from '@mui/icons-material/Autorenew';

function Loader (props: { type: 'small' | 'medium' | 'large' }) {
  const { type = 'large' } = props;
  return (
    <div className='loader-container'>
      <AutorenewIcon fontSize={type} className='loader-content'/>
    </div>
  )
}

export default Loader;

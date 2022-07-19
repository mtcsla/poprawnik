import { Quiz } from "@mui/icons-material";

export default () => {
  return (
    <div className='flex flex-col justify-center'>
      <h1 className='flex items-center truncate'>
        <Quiz className='mr-4' color='error' style={{ fontSize: '50px !important' }} />
        Błąd 404
      </h1>
      <p>
        Nie znaleziono szukanej strony.
      </p>
    </div>
  );
}
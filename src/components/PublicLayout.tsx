import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className='mx-auto sm:px-6 lg:px-24'>
      <Outlet />
    </div>
  );
}

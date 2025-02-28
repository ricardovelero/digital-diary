import { Outlet } from "react-router-dom";
import MainNav from "./MainNav";

export default function AppLayout() {
  return (
    <>
      <div className='flex h-16 items-center px-4 border-b'>
        <MainNav className='mx-6' />
      </div>
      <Outlet />
    </>
  );
}

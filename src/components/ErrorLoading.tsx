import { Bomb } from "lucide-react";

interface ErrorProps {
  message?: string;
}

export default function ErrorLoading({ message = "Error" }: ErrorProps) {
  return (
    <div className='container flex justify-center p-6 min-h-screen'>
      <div className='flex flex-col items-center justify-center'>
        <Bomb size={32} className='animate-pulse text-red-500' />
        <p className='mt-2 text-gray-500'>{message}</p>
      </div>
    </div>
  );
}

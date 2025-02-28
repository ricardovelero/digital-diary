import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = "Loading..." }: LoadingProps) {
  return (
    <div className='container flex justify-center p-6 min-h-screen'>
      <div className='flex flex-col items-center justify-center'>
        <Loader2 size={32} className='animate-spin text-gray-500' />
        <p className='mt-2 text-gray-500'>{message}</p>
      </div>
    </div>
  );
}

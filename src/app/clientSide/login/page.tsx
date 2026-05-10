'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ClientLoginRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0b1120] flex items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-bold text-white">Opening login...</h1>
        <p className="mt-2 text-sm text-gray-400">Admin and customer login is available on one page.</p>
      </div>
    </div>
  );
};

export default ClientLoginRedirect;

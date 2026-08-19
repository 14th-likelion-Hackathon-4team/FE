import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="min-h-dvh w-full bg-background text-text-main">
      <main className="flex min-h-dvh w-full items-center justify-center px-[clamp(18px,5vw,40px)] py-10">
        <Suspense fallback={<div>로딩 중...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default PublicLayout;

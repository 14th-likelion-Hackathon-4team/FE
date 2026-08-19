import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from '@/components/BottomNavigation/BottomNavigation';

const HomeLayout = () => {
  return (
    <div className="min-h-dvh w-full bg-background text-text-main">
      <main className="flex min-h-dvh w-full items-center justify-center px-[clamp(18px,5vw,40px)] pb-[calc(82px+env(safe-area-inset-bottom))]">
        <Suspense fallback={<div>로딩 중...</div>}>
          <Outlet />
        </Suspense>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default HomeLayout;

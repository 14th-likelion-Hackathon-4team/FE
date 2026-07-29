import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '@/components/Header/Header';

const HomeLayout = () => {
  return (
    <div className="w-[1280px] h-[832px] flex flex-col">
      <Header /> {/*h- 65px */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <Suspense fallback={<div>로딩 중...</div>}>
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
};

export default HomeLayout;

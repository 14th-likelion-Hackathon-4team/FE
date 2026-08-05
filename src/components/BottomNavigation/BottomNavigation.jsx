import { NavLink } from 'react-router-dom';

const navigationItems = [
  {
    label: '홈',
    to: '/',
    icon: '/assets/navigation/nav-home.png',
    iconClassName: 'size-[56px]',
    end: true,
  },
  {
    label: '루틴 관리',
    to: '/routines',
    icon: '/assets/navigation/nav-routine.png',
    iconClassName: 'size-[58px]',
  },
  {
    label: '리포트',
    to: '/reports',
    icon: '/assets/navigation/nav-report.svg',
    iconClassName: 'size-[60px]',
  },
  {
    label: '마이페이지',
    to: '/mypage',
    icon: '/assets/navigation/nav-profile.svg',
    iconClassName: 'h-[60px] w-[58px]',
  },
];

const BottomNavigation = () => {
  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-50 grid min-h-[82px] w-full grid-cols-4 border-t border-disabled bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      {navigationItems.map(({ label, to, icon, iconClassName, end }) => (
        <NavLink
          key={to}
          aria-label={label}
          className="flex min-h-[82px] items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-primary"
          end={end}
          to={to}
        >
          <img alt="" className={`${iconClassName} object-contain`} src={icon} />
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNavigation;

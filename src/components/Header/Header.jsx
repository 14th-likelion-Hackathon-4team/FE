import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="w-full h-[65px] bg-white border-b border-gray-200 flex items-center gap-3 px-6">
      <Link to="/">홈</Link>
      <Link to="/login">로그인</Link>
      <Link to="/signup">회원가입</Link>
      <Link to="/survey">타입검사페이지</Link>
      <Link to="/match">매칭페이지</Link>
      <Link to="/mypage">마이페이지</Link>
      <Link to="/profile/1">프로필페이지</Link>
    </header>
  );
};

export default Header;

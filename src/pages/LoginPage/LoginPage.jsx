import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const LoginPage = () => {
  const navigate = useNavigate();

  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [nickname, setNickname] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasError = Boolean(errorMessage);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !password) {
      setErrorMessage('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${BASE_URL}/api/v1/routinefit/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: userId,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
      }

      const { accessToken, refreshToken, user } = result.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('userId', String(user.id));

      setNickname(user.nickname);
      setIsLoggedIn(true);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToMain = () => {
    navigate('/');
  };

  if (isLoggedIn) {
    return (
      <div className="flex w-full max-w-[360px] flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-0">
          <h1 className="text-[32px] font-extrabold text-[#2C2C2C]">Routine Fit</h1>
          <img
            alt="Routine Fit 마스코트"
            className="h-[220px] w-[220px] object-contain"
            src="/assets/images/hamster1.png"
          />
          <p className="text-[20px] font-normal text-[#2C2C2C]">완벽한 하루 말고, 놓치지 않는 하루</p>
        </div>

        <div className="flex w-full flex-col items-center gap-4 rounded-3xl bg-surface p-6 shadow-md">
          <p className="self-start text-[14px] font-normal text-text-muted">로그인 성공!</p>
          <span className="text-[32px]">👋</span>
          <p className="text-[20px] font-semibold text-[#2C2C2C]">다시 만나서 반가워요!</p>
          <p className="text-center text-[14px] font-normal text-[#2C2C2C]">
            {nickname}님,
            <br />
            오늘도 함께 시작해볼까요?
          </p>
          <button
            className="mt-2 h-[52px] w-full rounded-xl bg-primary text-[16px] font-semibold text-[#2C2C2C]"
            onClick={handleGoToMain}
            type="button"
          >
            메인페이지로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[360px] flex-col items-center gap-8">
      <div className="flex flex-col items-center gap-0">
        <h1 className="text-[32px] font-extrabold text-[#2C2C2C]">Routine Fit</h1>
        <img
          alt="Routine Fit 마스코트"
          className="h-[220px] w-[220px] object-contain"
          src="/assets/images/hamster.png"
        />
        <p className="text-[20px] font-normal text-[#2C2C2C]">완벽한 하루 말고, 놓치지 않는 하루</p>
      </div>

      <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-normal text-text-main" htmlFor="userId">
            아이디
          </label>
          <input
            className={`h-[48px] w-full rounded-xl border bg-surface px-4 text-[14px] font-normal text-text-main placeholder:text-[#8A8A8A] focus:outline-none ${
              hasError ? 'border-[#D50505]' : 'border-primary-soft focus:border-primary'
            }`}
            id="userId"
            onChange={(e) => setUserId(e.target.value)}
            placeholder="아이디를 입력하세요"
            type="text"
            value={userId}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-normal text-text-main" htmlFor="password">
            비밀번호
          </label>
          <div className="relative">
            <input
              className={`h-[48px] w-full rounded-xl border bg-surface px-4 pr-11 text-[14px] font-normal text-text-main placeholder:text-[#8A8A8A] focus:outline-none ${
                hasError ? 'border-[#D50505]' : 'border-primary-soft focus:border-primary'
              }`}
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              type={showPassword ? 'text' : 'password'}
              value={password}
            />
            <button
              aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword((prev) => !prev)}
              type="button"
            >
              <img
                alt=""
                className="h-5 w-5"
                src={showPassword ? '/assets/images/eye.png' : '/assets/images/eye-off.png'}
              />
            </button>
          </div>
        </div>

        {errorMessage && (
          <p className="text-center text-[14px] font-normal text-[#D50505]">{errorMessage}</p>
        )}

        <button
          className="mt-2 h-[52px] w-full rounded-xl bg-primary text-[16px] font-semibold text-text-main disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="flex flex-col items-center gap-3 text-[12px] font-normal text-text-muted">
        <div className="flex gap-3">
          <button className="hover:text-text-main" type="button">
            아이디 찾기
          </button>
          <span>|</span>
          <button className="hover:text-text-main" type="button">
            비밀번호 찾기
          </button>
        </div>
        <p className="text-[#000000]">
          아직 계정이 없으신가요?{' '}
          <Link className="font-normal text-[#D50505]" to="/signup">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
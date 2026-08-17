import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SignupPage = () => {
  const navigate = useNavigate();

  const [nickname, setNickname] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNickname, setSuccessNickname] = useState('');

  const [idCheckStatus, setIdCheckStatus] = useState('idle');

  const specialCharRegex = /[^a-zA-Z0-9]/;
  const hasIdError = userId.length > 0 && specialCharRegex.test(userId);

  const passwordRuleRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
  const hasPasswordError = password.length > 0 && !passwordRuleRegex.test(password);
  const hasConfirmPasswordError = confirmPassword.length > 0 && confirmPassword !== password;
  const hasNicknameError = nickname.length > 20;

  useEffect(() => {
    if (!userId || hasIdError) {
      return;
    }

    const timer = setTimeout(async () => {
      setIdCheckStatus('checking');
      try {
        const response = await fetch(
          `${BASE_URL}/api/v1/routinefit/auth/check-id?loginId=${encodeURIComponent(userId)}`,
        );
        const result = await response.json();
        setIdCheckStatus(result.data.available ? 'available' : 'unavailable');
      } catch {
        setIdCheckStatus('idle');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [userId, hasIdError]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nickname || !userId || !password || !confirmPassword) {
      setSignupError('회원가입에 실패했습니다. 다시 시도해주세요.');
      return;
    }

    if (hasNicknameError || hasIdError || hasPasswordError || password !== confirmPassword) {
      setSignupError('회원가입에 실패했습니다. 다시 시도해주세요.');
      return;
    }

    if (idCheckStatus !== 'available') {
      setSignupError('아이디 중복확인을 완료해주세요.');
      return;
    }

    setIsSubmitting(true);
    setSignupError('');

    try {
      const signupResponse = await fetch(`${BASE_URL}/api/v1/routinefit/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: userId,
          password,
          nickname,
        }),
      });

      const signupResult = await signupResponse.json();

      if (!signupResponse.ok) {
        if (signupResponse.status === 409) {
          setIdCheckStatus('unavailable');
        }
        throw new Error(signupResult.message || '회원가입에 실패했습니다. 다시 시도해주세요.');
      }

      const loginResponse = await fetch(`${BASE_URL}/api/v1/routinefit/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: userId,
          password,
        }),
      });

      const loginResult = await loginResponse.json();

      if (loginResponse.ok) {
        localStorage.setItem('accessToken', loginResult.data.accessToken);
        localStorage.setItem('refreshToken', loginResult.data.refreshToken);
      }

      setSuccessNickname(signupResult.data.nickname);
      setIsSignedUp(true);
    } catch (err) {
      setSignupError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToRoutines = () => {
    navigate('/routines');
  };

  if (isSignedUp) {
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
          <p className="self-start text-[14px] font-normal text-text-muted">회원가입 성공!</p>
          <span className="text-[32px]">🎉</span>
          <p className="text-[20px] font-semibold text-[#2C2C2C]">회원가입에 성공했습니다!</p>
          <p className="text-center text-[14px] font-normal text-[#2C2C2C]">
            {successNickname}님,
            <br />
            환영해요.
            <br />
            바로 첫 루틴을 등록해볼까요?
          </p>
          <button
            className="mt-2 h-[52px] w-full rounded-xl bg-primary text-[16px] font-semibold text-[#2C2C2C]"
            onClick={handleGoToRoutines}
            type="button"
          >
            루틴 관리 페이지로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[360px] flex-col gap-6">
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-[20px] font-extrabold text-[#2C2C2C]">회원가입</h1>
        <p className="text-[14px] font-normal text-[#2C2C2C]">루틴핏과 함께 시작해봐요</p>
      </div>

      {signupError && (
        <div className="w-full rounded-xl border border-[#D50505] bg-[#FFE8EB] px-4 py-3 text-[14px] font-semibold text-[#D50505]">
          ⚠️{signupError}
        </div>
      )}

      <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[14px] font-normal text-[#2C2C2C]" htmlFor="nickname">
              닉네임
            </label>
            <span className="rounded-full bg-[#F6C94C]/[0.298] px-2 py-0.5 text-[14px] font-medium text-[#D29E0F]">
              호칭으로 사용
            </span>
          </div>
          <input
            className={`h-[48px] w-full rounded-xl border px-4 text-[14px] font-normal text-text-main placeholder:text-[14px] placeholder:font-normal placeholder:text-[#8A8A8A] focus:outline-none ${
              hasNicknameError
                ? 'border-[#D50505] bg-[#FFE8EB]'
                : 'border-primary-soft bg-surface focus:border-primary'
            }`}
            id="nickname"
            onChange={(e) => setNickname(e.target.value)}
            placeholder="AI 대화에서 불릴 이름"
            type="text"
            value={nickname}
          />
          {hasNicknameError && (
            <p className="text-[12px] font-medium text-[#D50505]">닉네임은 20자 이내로 입력해주세요</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[14px] font-normal text-[#2C2C2C]" htmlFor="userId">
              아이디
            </label>
            <span className="rounded-full bg-[#F6C94C]/[0.298] px-2 py-0.5 text-[14px] font-medium text-[#D29E0F]">
              특수문자 불가
            </span>
          </div>
          <input
            className={`h-[48px] w-full rounded-xl border px-4 text-[14px] font-normal text-text-main placeholder:text-[14px] placeholder:font-normal placeholder:text-[#8A8A8A] focus:outline-none ${
              hasIdError || idCheckStatus === 'unavailable'
                ? 'border-[#D50505] bg-[#FFE8EB]'
                : 'border-primary-soft bg-surface focus:border-primary'
            }`}
            id="userId"
            onChange={(e) => setUserId(e.target.value)}
            placeholder="아이디를 입력하세요"
            type="text"
            value={userId}
          />
          {hasIdError && (
            <p className="text-[12px] font-medium text-[#D50505]">특수문자는 사용할 수 없습니다</p>
          )}
          {!hasIdError && userId && idCheckStatus === 'checking' && (
            <p className="text-[12px] font-medium text-text-muted">확인 중...</p>
          )}
          {!hasIdError && userId && idCheckStatus === 'available' && (
            <p className="text-[12px] font-medium text-[#4F8C5B]">✓ 사용 가능한 아이디에요</p>
          )}
          {!hasIdError && userId && idCheckStatus === 'unavailable' && (
            <p className="text-[12px] font-medium text-[#D50505]">이미 사용 중인 아이디입니다</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-normal text-[#2C2C2C]" htmlFor="password">
            비밀번호
          </label>
          <div className="relative">
            <input
              className={`h-[48px] w-full rounded-xl border px-4 pr-11 text-[14px] font-normal text-text-main placeholder:text-[14px] placeholder:font-normal placeholder:text-[#8A8A8A] focus:outline-none ${
                hasPasswordError
                  ? 'border-[#D50505] bg-[#FFE8EB]'
                  : 'border-primary-soft bg-surface focus:border-primary'
              }`}
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="영문 + 숫자 8자 이상"
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
          {hasPasswordError && (
            <p className="text-[12px] font-medium text-[#D50505]">
              영문, 숫자를 포함해 8자 이상 입력해주세요
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[14px] font-normal text-[#2C2C2C]" htmlFor="confirmPassword">
            비밀번호 확인
          </label>
          <div className="relative">
            <input
              className={`h-[48px] w-full rounded-xl border px-4 pr-11 text-[14px] font-normal text-text-main placeholder:text-[14px] placeholder:font-normal placeholder:text-[#8A8A8A] focus:outline-none ${
                hasConfirmPasswordError
                  ? 'border-[#D50505] bg-[#FFE8EB]'
                  : 'border-primary-soft bg-surface focus:border-primary'
              }`}
              id="confirmPassword"
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 한 번 더 입력"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
            />
            <button
              aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              type="button"
            >
              <img
                alt=""
                className="h-5 w-5"
                src={showConfirmPassword ? '/assets/images/eye.png' : '/assets/images/eye-off.png'}
              />
            </button>
          </div>
          {hasConfirmPasswordError && (
            <p className="text-[12px] font-medium text-[#D50505]">비밀번호가 일치하지 않습니다</p>
          )}
        </div>

        <button
          className="mt-2 h-[52px] w-full rounded-xl bg-primary text-[16px] font-semibold text-[#2C2C2C] disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? '가입 중...' : '회원가입'}
        </button>
      </form>

      <p className="text-[12px] font-normal text-[#000000]">
        이미 계정이 있으신가요?{' '}
        <Link className="font-bold text-[#000000]" to="/login">
          로그인
        </Link>
      </p>
    </div>
  );
};

export default SignupPage;
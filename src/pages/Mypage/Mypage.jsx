import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
});

const toneOptions = [
  { label: '차분한 벨', value: '차분한벨' },
  { label: '경쾌한 벨', value: '경쾌한벨' },
  { label: '무음(배너만)', value: '무음' },
];

const timeOptions = [
  { label: '루틴 1시간 전', value: '1시간전' },
  { label: '루틴 2시간 전', value: '2시간전' },
  { label: '직접 설정', value: '직접설정' },
];

const Mypage = () => {
  const navigate = useNavigate();

  const [view, setView] = useState('main');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChangedModal, setShowPasswordChangedModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [nickname, setNickname] = useState('');
  const [editNickname, setEditNickname] = useState('');
  const [editNicknameError, setEditNicknameError] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [routineAlarm, setRoutineAlarm] = useState(true);
  const [missionReminder, setMissionReminder] = useState(false);
  const [alarmTone, setAlarmTone] = useState('차분한벨');
  const [alarmTime, setAlarmTime] = useState('1시간전');
  const [customAlarmMinutes, setCustomAlarmMinutes] = useState('');
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notificationErrorMessage, setNotificationErrorMessage] = useState('');

  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const NICKNAME_MAX_LENGTH = 50;
  const PASSWORD_MIN_LENGTH = 8;
  const PASSWORD_MAX_LENGTH = 72;

  useEffect(() => {
    const fetchMyInfo = async () => {
      setIsLoading(true);
      setLoadError('');

      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch(`${BASE_URL}/api/v1/routinefit/users/me`, {
          method: 'GET',
          headers: authHeaders(),
        });

        if (response.status === 401) {
          navigate('/login');
          return;
        }

        const text = await response.text();
        const result = text ? JSON.parse(text) : null;

        if (!response.ok || !result) {
          throw new Error(result?.message || '정보를 불러오지 못했습니다.');
        }

        setNickname(result.data.nickname);
        setEditNickname(result.data.nickname);
        setRoutineAlarm(result.data.routineAlarmOn);
        setMissionReminder(result.data.altMissionReminderOn);
        setAlarmTone(result.data.alarmSound);
        setAlarmTime(result.data.alarmOffsetType);
        if (result.data.alarmOffsetType === '직접설정' && result.data.alarmOffsetMinutes) {
          setCustomAlarmMinutes(String(result.data.alarmOffsetMinutes));
        }
      } catch (err) {
        setLoadError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyInfo();
  }, [navigate]);

  const handleGoToReports = () => {
    navigate('/reports');
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BASE_URL}/api/v1/routinefit/auth/logout`, {
        method: 'POST',
        headers: authHeaders(),
      });
    } catch {
      // 로그아웃 API 실패해도 클라이언트에서는 토큰 정리하고 이동
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditNicknameError('');
    setPasswordError('');

    if (editNickname.length > NICKNAME_MAX_LENGTH) {
      setEditNicknameError(`닉네임은 ${NICKNAME_MAX_LENGTH}자 이내로 입력해주세요.`);
      return;
    }

    const wantsPasswordChange = currentPassword || newPassword || confirmNewPassword;

    if (wantsPasswordChange) {
      if (newPassword.length < PASSWORD_MIN_LENGTH || newPassword.length > PASSWORD_MAX_LENGTH) {
        setPasswordError(
          `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상 ${PASSWORD_MAX_LENGTH}자 이하로 입력해주세요.`,
        );
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setPasswordError('새 비밀번호가 일치하지 않습니다.');
        return;
      }
    }

    setIsSavingProfile(true);

    try {
      if (editNickname !== nickname) {
        const response = await fetch(
          `${BASE_URL}/api/v1/routinefit/users/me/nickname`,
          {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify({ nickname: editNickname }),
          },
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || '닉네임 변경에 실패했습니다.');
        }

        setNickname(result.data.nickname);
      }

      if (wantsPasswordChange) {
        const response = await fetch(
          `${BASE_URL}/api/v1/routinefit/users/me/password`,
          {
            method: 'PATCH',
            headers: authHeaders(),
            body: JSON.stringify({
              currentPassword,
              newPassword,
              newPasswordConfirm: confirmNewPassword,
            }),
          },
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || '비밀번호 변경에 실패했습니다.');
        }

        // 비밀번호 변경 성공 시 강제 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setShowPasswordChangedModal(true);
        return;
      }

      setView('main');
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    setNotificationErrorMessage('');
    setIsSavingNotifications(true);

    try {
      const response = await fetch(
        `${BASE_URL}/api/v1/routinefit/users/me/notifications`,
        {
          method: 'PATCH',
          headers: authHeaders(),
          body: JSON.stringify({
            routineAlarmOn: routineAlarm,
            altMissionReminderOn: missionReminder,
            alarmSound: alarmTone,
            alarmOffsetType: alarmTime,
            alarmOffsetMinutes:
              alarmTime === '직접설정' && customAlarmMinutes
                ? Number(customAlarmMinutes)
                : null,
          }),
        },
      );
      const result = await response.json();

      if (!response.ok) {
        setNotificationErrorMessage(result.message || '알림 설정 저장에 실패했습니다.');
        return;
      }

      setView('main');
    } catch (err) {
      setNotificationErrorMessage(err.message);
    } finally {
      setIsSavingNotifications(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError('');

    if (!deletePassword) {
      setDeleteError('비밀번호를 입력해주세요.');
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`${BASE_URL}/api/v1/routinefit/users/me`, {
        method: 'DELETE',
        headers: authHeaders(),
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || '회원 탈퇴에 실패했습니다.');
      }

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/login');
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex w-full max-w-[360px] items-center justify-center py-20">
        <p className="text-[14px] font-normal text-text-muted">불러오는 중...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex w-full max-w-[360px] flex-col items-center gap-3 py-20">
        <p className="text-[14px] font-normal text-[#D50505]">{loadError}</p>
      </div>
    );
  }

  if (view === 'edit') {
    return (
      <div className="flex w-full max-w-[360px] flex-col gap-6">
        <div className="relative flex items-center justify-center">
          <button
            aria-label="이전화면으로 돌아가기"
            className="absolute left-0"
            onClick={() => setView('main')}
            type="button"
          >
            <span className="text-[20px] text-[#2C2C2C]">‹</span>
          </button>
          <h1 className="text-[20px] font-extrabold text-[#2C2C2C]">회원 정보 수정</h1>
        </div>

        <form className="flex w-full flex-col gap-4" onSubmit={handleSaveProfile}>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[14px] font-normal text-[#2C2C2C]" htmlFor="editNickname">
                닉네임
              </label>
              <span className="rounded-full bg-[#F6C94C]/[0.298] px-2 py-0.5 text-[14px] font-medium text-[#D29E0F]">
                호칭으로 사용
              </span>
            </div>
            <input
              className="h-[48px] w-full rounded-xl border border-primary-soft bg-surface px-4 text-[14px] font-normal text-text-main focus:border-primary focus:outline-none"
              id="editNickname"
              maxLength={NICKNAME_MAX_LENGTH}
              onChange={(e) => setEditNickname(e.target.value)}
              type="text"
              value={editNickname}
            />
            {editNicknameError && (
              <p className="text-[12px] font-medium text-[#D50505]">{editNicknameError}</p>
            )}
          </div>

          <p className="text-[14px] font-medium text-[#D29E0F]">비밀번호 변경</p>

          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-normal text-[#2C2C2C]" htmlFor="currentPassword">
              기존 비밀번호 확인
            </label>
            <div className="relative">
              <input
                className="h-[48px] w-full rounded-xl border border-primary-soft bg-surface px-4 pr-11 text-[14px] font-normal text-text-main placeholder:text-[14px] placeholder:font-normal placeholder:text-[#8A8A8A] focus:border-primary focus:outline-none"
                id="currentPassword"
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호"
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
              />
              <button
                aria-label={showCurrentPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                type="button"
              >
                <img
                  alt=""
                  className="h-5 w-5"
                  src={showCurrentPassword ? '/assets/images/eye.png' : '/assets/images/eye-off.png'}
                />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-normal text-[#2C2C2C]" htmlFor="newPassword">
              신규 비밀번호
            </label>
            <div className="relative">
              <input
                className="h-[48px] w-full rounded-xl border border-primary-soft bg-surface px-4 pr-11 text-[14px] font-normal text-text-main placeholder:text-[14px] placeholder:font-normal placeholder:text-[#8A8A8A] focus:border-primary focus:outline-none"
                id="newPassword"
                maxLength={PASSWORD_MAX_LENGTH}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="영문 + 숫자 8자 이상"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
              />
              <button
                aria-label={showNewPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowNewPassword((prev) => !prev)}
                type="button"
              >
                <img
                  alt=""
                  className="h-5 w-5"
                  src={showNewPassword ? '/assets/images/eye.png' : '/assets/images/eye-off.png'}
                />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[14px] font-normal text-[#2C2C2C]" htmlFor="confirmNewPassword">
              신규 비밀번호 확인
            </label>
            <div className="relative">
              <input
                className="h-[48px] w-full rounded-xl border border-primary-soft bg-surface px-4 pr-11 text-[14px] font-normal text-text-main placeholder:text-[14px] placeholder:font-normal placeholder:text-[#8A8A8A] focus:border-primary focus:outline-none"
                id="confirmNewPassword"
                maxLength={PASSWORD_MAX_LENGTH}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="한 번 더 입력"
                type={showConfirmNewPassword ? 'text' : 'password'}
                value={confirmNewPassword}
              />
              <button
                aria-label={showConfirmNewPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowConfirmNewPassword((prev) => !prev)}
                type="button"
              >
                <img
                  alt=""
                  className="h-5 w-5"
                  src={showConfirmNewPassword ? '/assets/images/eye.png' : '/assets/images/eye-off.png'}
                />
              </button>
            </div>
          </div>

          {passwordError && (
            <p className="text-[12px] font-medium text-[#D50505]">{passwordError}</p>
          )}

          <button
            className="mt-2 h-[52px] w-full rounded-xl bg-primary text-[16px] font-semibold text-[#2C2C2C] disabled:opacity-60"
            disabled={isSavingProfile}
            type="submit"
          >
            {isSavingProfile ? '저장 중...' : '저장하기'}
          </button>
        </form>

        {showPasswordChangedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-[clamp(18px,5vw,40px)]">
            <div className="flex w-full max-w-[320px] flex-col items-center gap-4 rounded-3xl bg-background p-6 text-center">
              <h2 className="text-[24px] font-extrabold text-[#2C2C2C]">Routine Fit</h2>
              <span className="text-[28px]">🔒</span>
              <p className="text-[16px] font-semibold text-[#2C2C2C]">비밀번호가 변경되었습니다</p>
              <p className="text-[12px] font-normal text-text-muted">
                보안을 위해 로그아웃되었습니다.
                <br />
                새 비밀번호로 다시 로그인해주세요.
              </p>
              <button
                className="mt-2 h-[48px] w-full rounded-xl bg-primary text-[14px] font-semibold text-[#2C2C2C]"
                onClick={() => navigate('/login')}
                type="button"
              >
                로그인하러 가기
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'notifications') {
    return (
      <div className="flex w-full max-w-[360px] flex-col gap-6">
        <div className="relative flex items-center justify-center">
          <button
            aria-label="이전화면으로 돌아가기"
            className="absolute left-0"
            onClick={() => setView('main')}
            type="button"
          >
            <span className="text-[20px] text-[#2C2C2C]">‹</span>
          </button>
          <h1 className="text-[20px] font-extrabold text-[#2C2C2C]">알림 설정</h1>
        </div>

        <form className="flex w-full flex-col gap-4" onSubmit={handleSaveNotifications}>
          <div className="flex flex-col overflow-hidden rounded-2xl border border-[#F6C94C]/45 bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
            <div className="flex items-center justify-between border-b border-[#F6C94C]/45 px-4 py-4">
              <span className="text-[14px] font-normal text-[#2C2C2C]">루틴 체크 알림</span>
              <button
                aria-label="루틴 체크 알림 켜기/끄기"
                className={`h-6 w-11 rounded-full transition-colors ${
                  routineAlarm ? 'bg-[#D8F4D1]' : 'bg-[#FFE2E2]'
                }`}
                onClick={() => setRoutineAlarm((prev) => !prev)}
                type="button"
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    routineAlarm ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-[14px] font-normal text-[#2C2C2C]">대체미션 리마인드</span>
              <button
                aria-label="대체미션 리마인드 켜기/끄기"
                className={`h-6 w-11 rounded-full transition-colors ${
                  missionReminder ? 'bg-[#D8F4D1]' : 'bg-[#FFE2E2]'
                }`}
                onClick={() => setMissionReminder((prev) => !prev)}
                type="button"
              >
                <span
                  className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    missionReminder ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-medium text-[#D29E0F]">알림 음조</p>
            <div className="flex flex-wrap gap-2">
              {toneOptions.map(({ label, value }) => (
                <button
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium ${
                    alarmTone === value
                      ? 'bg-[#D8F4D1] text-[#4F8C5B]'
                      : 'bg-[#FFE2E2] text-[#C75A55]'
                  }`}
                  key={value}
                  onClick={() => setAlarmTone(value)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-medium text-[#D29E0F]">알림 시간</p>
            <div className="flex flex-wrap gap-2">
              {timeOptions.map(({ label, value }) => (
                <button
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium ${
                    alarmTime === value
                      ? 'bg-[#D8F4D1] text-[#4F8C5B]'
                      : 'bg-[#FFE2E2] text-[#C75A55]'
                  }`}
                  key={value}
                  onClick={() => setAlarmTime(value)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>

            {alarmTime === '직접설정' && (
              <div className="mt-1 flex items-center gap-2">
                <input
                  className="h-[44px] w-[100px] rounded-xl border border-primary-soft bg-surface px-3 text-[14px] font-normal text-text-main focus:border-primary focus:outline-none"
                  max="1440"
                  min="1"
                  onChange={(e) => setCustomAlarmMinutes(e.target.value)}
                  placeholder="숫자 입력"
                  type="number"
                  value={customAlarmMinutes}
                />
                <span className="text-[14px] font-normal text-[#2C2C2C]">분 전</span>
              </div>
            )}
          </div>

          <button
            className="mt-2 h-[52px] w-full rounded-xl bg-primary text-[16px] font-semibold text-[#2C2C2C] disabled:opacity-60"
            disabled={isSavingNotifications}
            type="submit"
          >
            {isSavingNotifications ? '저장 중...' : '저장하기'}
          </button>
        </form>

        {notificationErrorMessage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-[clamp(18px,5vw,40px)]">
            <div className="flex w-full max-w-[320px] flex-col items-center gap-4 rounded-3xl bg-background p-6 text-center">
              <h2 className="text-[24px] font-extrabold text-[#2C2C2C]">Routine Fit</h2>
              <span className="text-[28px]">⚠️</span>
              <p className="text-[16px] font-semibold text-[#2C2C2C]">알림 설정을 저장하지 못했어요</p>
              <p className="text-[12px] font-normal text-text-muted">{notificationErrorMessage}</p>
              <button
                className="mt-2 h-[48px] w-full rounded-xl bg-primary text-[14px] font-semibold text-[#2C2C2C]"
                onClick={() => setNotificationErrorMessage('')}
                type="button"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-[360px] flex-col gap-6">
      <h1 className="text-[24px] font-extrabold text-[#2C2C2C]">마이페이지</h1>

      <div className="flex items-center gap-3 rounded-2xl border border-[#F6C94C]/45 bg-surface p-4 shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
        <div className="flex h-[56px] w-[56px] items-center justify-center rounded-full bg-primary-soft">
          <img
            alt="프로필"
            className="h-[44px] w-[44px] rounded-full object-contain"
            src="/assets/images/hamster.png"
          />
        </div>
        <span className="text-[16px] font-semibold text-[#2C2C2C]">{nickname}</span>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-[#F6C94C]/45 bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
        <button
          className="flex items-center gap-3 border-b border-[#F6C94C]/45 px-4 py-4 text-[14px] font-medium text-[#2C2C2C]"
          onClick={() => setView('edit')}
          type="button"
        >
          <span className="text-[16px]">👤</span>
          회원 정보 수정
        </button>
        <button
          className="flex items-center gap-3 border-b border-[#F6C94C]/45 px-4 py-4 text-[14px] font-medium text-[#2C2C2C]"
          onClick={handleGoToReports}
          type="button"
        >
          <span className="text-[16px]">📊</span>
          지난 리포트 조회
        </button>
        <button
          className="flex items-center gap-3 px-4 py-4 text-[14px] font-medium text-[#2C2C2C]"
          onClick={() => setView('notifications')}
          type="button"
        >
          <span className="text-[16px]">🔔</span>
          알림 설정
        </button>
      </div>

      <div className="flex flex-col overflow-hidden rounded-2xl border border-[#F6C94C]/45 bg-surface shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
        <button
          className="flex items-center gap-3 border-b border-[#F6C94C]/45 px-4 py-4 text-[14px] font-medium text-[#2C2C2C]"
          onClick={handleLogout}
          type="button"
        >
          <span className="text-[16px]">🚪</span>
          로그아웃
        </button>
        <button
          className="flex items-center gap-3 px-4 py-4 text-[14px] font-medium text-[#2C2C2C]"
          onClick={() => setShowDeleteConfirm(true)}
          type="button"
        >
          <span className="text-[16px]">⚠️</span>
          회원탈퇴
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-[clamp(18px,5vw,40px)]">
          <div className="flex w-full max-w-[320px] flex-col items-center gap-4 rounded-3xl bg-background p-6 text-center">
            <h2 className="text-[24px] font-extrabold text-[#2C2C2C]">Routine Fit</h2>
            <span className="text-[28px]">⚠️</span>
            <p className="text-[16px] font-semibold text-[#2C2C2C]">정말 탈퇴하시겠습니까?</p>
            <p className="text-[12px] font-normal text-text-muted">
              탈퇴 시 모든 루틴과 리포트 데이터가
              <br />
              영구적으로 삭제되며
              <br />
              복구할 수 없습니다.
            </p>
            <input
              className="h-[44px] w-full rounded-xl border border-primary-soft bg-surface px-4 text-[14px] font-normal text-text-main placeholder:text-[#8A8A8A] focus:border-primary focus:outline-none"
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="비밀번호 확인"
              type="password"
              value={deletePassword}
            />
            {deleteError && (
              <p className="text-[12px] font-medium text-[#D50505]">{deleteError}</p>
            )}
            <div className="flex w-full gap-3">
              <button
                className="h-[48px] flex-1 rounded-xl bg-disabled text-[14px] font-semibold text-[#2C2C2C]"
                onClick={() => setShowDeleteConfirm(false)}
                type="button"
              >
                뒤로
              </button>
              <button
                className="h-[48px] flex-1 rounded-xl bg-[#FFE2E2] text-[14px] font-semibold text-[#D50505] disabled:opacity-60"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                type="button"
              >
                {isDeleting ? '처리 중...' : '탈퇴'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mypage;
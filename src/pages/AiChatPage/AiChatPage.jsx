import { useState } from 'react';
import { FiChevronLeft, FiDroplet, FiHeart, FiSmile } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const mockUser = { nickname: '00' };

const routines = [
  { id: 'morning-meal', title: '아침 식단', time: '08:00', status: '완료', tone: 'green', icon: FiSmile },
  { id: 'water', title: '물 2L 마시기', time: '13:00', status: '대체 미션 완료', tone: 'blue', icon: FiDroplet },
  { id: 'evening-meal', title: '저녁 식단', time: '21:00', status: '대기', tone: 'green', icon: FiSmile },
  { id: 'skin-care', title: '스킨 케어', time: '23:00', status: '대기', tone: 'red', icon: FiHeart },
];

const reasons = ['피로', '시간부족', '기분', '기타'];

const toneStyles = {
  green: 'bg-[#d9f2d5] text-[#67bb82]',
  blue: 'bg-[#dcebff] text-[#7baded]',
  red: 'bg-[#f9dfdf] text-[#e78d84]',
};

const getStatusStyle = (status) => {
  if (status === '완료') return 'bg-[#d9f2d5] text-[#64a56e]';
  if (status === '대체 미션 완료') return 'bg-[#dceaff] text-[#6994cc]';
  return 'bg-[#ececec] text-[#777]';
};

const RoutineOption = ({ icon: Icon, isSelected, onSelect, status, time, title, tone }) => (
  <button
    aria-pressed={isSelected}
    className={`grid min-h-[70px] w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border px-3 text-left transition-[border-color,box-shadow,transform] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-primary ${
      isSelected
        ? 'border-2 border-[#f0ca55] bg-[#fffdf2] shadow-[0_0_0_3px_rgba(246,201,76,0.1)]'
        : 'border-[#ebe8e1] bg-white shadow-[0_1px_3px_rgba(44,44,44,0.03)]'
    }`}
    onClick={onSelect}
    type="button"
  >
    <span className={`flex size-11 items-center justify-center rounded-2xl ${toneStyles[tone]}`}>
      <Icon aria-hidden="true" className="size-7" strokeWidth={2.4} />
    </span>
    <span className="min-w-0">
      <strong className="block truncate text-[16px] font-bold leading-tight text-[#292929]">{title}</strong>
      <span className="mt-1 block text-[14px] leading-none text-[#8d8d8d]">{time}</span>
    </span>
    <span className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold leading-none ${getStatusStyle(status)}`}>
      {status}
    </span>
  </button>
);

const StepButtons = ({ isNextDisabled, onBack, onNext }) => (
  <div className="mt-8 grid grid-cols-2 gap-10 px-2">
    <button
      className="min-h-[52px] rounded-xl border border-[#e4e4e4] bg-white text-[16px] font-semibold text-[#444] shadow-[0_1px_3px_rgba(44,44,44,0.03)] active:scale-[0.99]"
      onClick={onBack}
      type="button"
    >
      뒤로
    </button>
    <button
      className="min-h-[52px] rounded-xl bg-[#f4cf56] text-[16px] font-semibold text-[#333] transition-colors disabled:cursor-not-allowed disabled:bg-[#ececec] disabled:text-[#999]"
      disabled={isNextDisabled}
      onClick={onNext}
      type="button"
    >
      다음
    </button>
  </div>
);

const CoachHeader = ({ children }) => (
  <>
    <h1 className="text-center text-[24px] font-extrabold text-[#1f1f1f]">AI 코치</h1>
    <div className="mt-5 flex flex-col items-center">
      <img alt="AI 코치 햄스터" className="h-[112px] w-auto object-contain" src="/assets/images/hamster.png" />
      {children}
    </div>
  </>
);

const AiChatPage = () => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('start');
  const [selectedRoutineId, setSelectedRoutineId] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState('');
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const selectedRoutine = routines.find(({ id }) => id === selectedRoutineId);

  const handleAcceptMission = () => {
    if (!selectedRoutine) return;

    navigate('/', {
      state: {
        alternativeMission: {
          routineId: selectedRoutine.id,
          originalTitle: selectedRoutine.title,
          title: '스트레칭',
          time: selectedRoutine.time,
          kind: 'alternative',
          status: '대체 미션 진행중',
        },
      },
    });
  };

  const handleRejectMission = () => {
    if (!selectedRoutine) return;

    navigate('/', {
      state: {
        routineUpdate: {
          kind: 'rejected',
          routineId: selectedRoutine.id,
          status: '미완료',
        },
      },
    });
  };

  const handleHeaderBack = () => {
    if (screen === 'start') {
      navigate(-1);
      return;
    }

    setScreen('start');
    setSelectedRoutineId(null);
    setSelectedReason(null);
    setCustomReason('');
    setIsMethodOpen(false);
  };

  const handleBack = () => {
    if (screen === 'suggestion') {
      setScreen('reason');
      return;
    }
    if (screen === 'custom-reason') {
      setScreen('reason');
      setSelectedReason(null);
      setCustomReason('');
      return;
    }
    if (screen === 'reason') {
      setScreen('select');
      setSelectedReason(null);
      return;
    }
    if (screen === 'select') {
      setScreen('start');
      setSelectedRoutineId(null);
      return;
    }
    navigate(-1);
  };

  return (
    <section className="font-pretendard relative mx-auto min-h-[calc(100dvh-82px-env(safe-area-inset-bottom))] w-full max-w-[430px] self-start overflow-x-hidden">
      <button
        aria-label="이전 화면으로 돌아가기"
        className="absolute left-0 top-5 z-10 flex size-11 items-center justify-center rounded-full text-[#2c2c2c] transition-colors hover:bg-[#f4f0e6] focus-visible:outline-2 focus-visible:outline-primary"
        onClick={handleHeaderBack}
        type="button"
      >
        <FiChevronLeft className="size-10" strokeWidth={3} />
      </button>

      {screen === 'start' && (
        <div className="flex min-h-[calc(100dvh-82px-env(safe-area-inset-bottom))] w-full flex-col items-center justify-center">
          <div className="relative flex flex-col items-center">
            <div aria-hidden="true" className="absolute -top-10 right-5 z-10 flex flex-col items-center">
              <span className="text-[32px] leading-none drop-shadow-[0_2px_2px_rgba(246,201,76,0.25)]">💡</span>
              <span className="mt-[-3px] text-[14px] tracking-[0.25em] text-[#f4c94f]">✦ · ✦</span>
            </div>
            <img alt="대화를 제안하는 햄스터 캐릭터" className="h-[128px] w-auto object-contain" src="/assets/images/hamster1.png" />
            <button
              className="mt-1 min-h-[60px] rounded-full bg-[#f4cf56] px-9 text-[20px] font-bold text-[#2d2d2d] shadow-[0_5px_12px_rgba(187,144,36,0.2)] transition-[transform,box-shadow,background-color] hover:bg-[#f1c747] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={() => setScreen('select')}
              type="button"
            >
              대화 시작하기
            </button>
          </div>
        </div>
      )}

      {screen === 'select' && (
        <div className="mx-auto flex w-full max-w-[390px] flex-col px-1 pb-8 pt-5">
          <CoachHeader>
            <p className="mt-3 text-center text-[20px] font-semibold leading-[1.35] tracking-[-0.025em] text-[#202020]">
              안녕하세요, {mockUser.nickname}님! <span aria-hidden="true">👋</span>
              <br />
              무엇을 도와드릴까요?
            </p>
          </CoachHeader>

          <p className="mb-3 mt-8 text-[14px] font-medium text-[#8a8a8a]">상담할 루틴을 선택해주세요</p>
          <div className="ai-select-items flex flex-col gap-3">
            {routines.map((routine) => (
              <RoutineOption
                {...routine}
                isSelected={selectedRoutineId === routine.id}
                key={routine.id}
                onSelect={() => setSelectedRoutineId((current) => current === routine.id ? null : routine.id)}
              />
            ))}
          </div>

          <StepButtons
            isNextDisabled={!selectedRoutineId}
            onBack={handleBack}
            onNext={() => setScreen('reason')}
          />
        </div>
      )}

      {screen === 'reason' && (
        <div className="mx-auto flex w-full max-w-[390px] flex-col px-1 pb-8 pt-10">
          <CoachHeader>
            <p className="mt-4 text-center text-[20px] font-semibold tracking-[-0.025em] text-[#202020]">
              루틴을 어떻게 못지키게 되었나요?
            </p>
          </CoachHeader>

          <div className="ai-select-items mt-12 flex flex-col gap-5 px-8">
            {reasons.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <button
                  aria-pressed={isSelected}
                  className={`min-h-[70px] rounded-[18px] border text-[16px] font-semibold transition-[border-color,background-color,box-shadow,transform] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-primary ${
                    isSelected
                      ? 'border-2 border-[#f0ca55] bg-[#fffdf2] shadow-[0_0_0_3px_rgba(246,201,76,0.1)]'
                      : 'border-[#e9e6df] bg-white shadow-[0_1px_3px_rgba(44,44,44,0.03)]'
                  }`}
                  key={reason}
                  onClick={() => {
                    if (reason === '기타') {
                      setSelectedReason('기타');
                      setScreen('custom-reason');
                      return;
                    }
                    setSelectedReason((current) => current === reason ? null : reason);
                  }}
                  type="button"
                >
                  {reason}
                </button>
              );
            })}
          </div>

          <StepButtons isNextDisabled={!selectedReason} onBack={handleBack} onNext={() => setScreen('suggestion')} />
        </div>
      )}
      {screen === 'custom-reason' && (
        <div className="mx-auto flex w-full max-w-[390px] flex-col px-1 pb-8 pt-10">
          <CoachHeader>
            <p className="mt-4 text-center text-[20px] font-semibold tracking-[-0.025em] text-[#202020]">
              이유를 입력해주세요.
            </p>
          </CoachHeader>

          <label className="sr-only" htmlFor="custom-reason">루틴을 지키기 어려운 이유</label>
          <textarea
            autoFocus
            className="mt-6 min-h-[220px] w-full resize-none rounded-[20px] border border-[#e7e3da] bg-white p-5 text-[16px] leading-[1.6] text-[#2f2f2f] outline-none transition-colors placeholder:text-[#aaa] focus:border-[#f0cf5c] focus:ring-2 focus:ring-[#f0cf5c]/20"
            id="custom-reason"
            maxLength={300}
            onChange={(event) => setCustomReason(event.target.value)}
            placeholder="이유를 자유롭게 입력해주세요."
            value={customReason}
          />

          <StepButtons
            isNextDisabled={!customReason.trim()}
            onBack={handleBack}
            onNext={() => {
              setSelectedReason(customReason.trim());
              setScreen('suggestion');
            }}
          />
        </div>
      )}

      {screen === 'suggestion' && (
        <div className="mx-auto flex w-full max-w-[430px] flex-col pb-8 pt-5">
          <h1 className="text-center text-[24px] font-extrabold text-[#1f1f1f]">AI 코치</h1>

          <div className="mt-5 flex justify-end px-3">
            <div className="flex size-[64px] items-center justify-center overflow-hidden rounded-full bg-[#e5e5e5]">
              <img alt="AI 코치 햄스터" className="h-[72px] w-auto max-w-none object-contain" src="/assets/images/hamster.png" />
            </div>
          </div>

          <div className="ai-message-pop mt-4 w-full max-w-[340px] rounded-[18px] border border-[#ebe8e1] bg-white px-4 py-6 shadow-[0_1px_4px_rgba(44,44,44,0.04)]">
            <p className="break-keep text-[14px] font-medium leading-[1.5] text-[#444]">
              괜찮아요! 대체할 수 있는 방법을 제안해줄게요
            </p>
          </div>

          <article className="ai-proposal-pop mt-5 rounded-[22px] border-2 border-[#f0d36e] bg-[#fffdf2] px-5 pb-6 pt-5 shadow-[0_4px_10px_rgba(187,144,36,0.08)]">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-[32px] leading-none text-[#efc54f]">✦</span>
              <h2 className="text-[16px] font-semibold text-[#777268]">대체 제안</h2>
            </div>

            <p className="mt-5 text-[20px] font-bold leading-[1.3] tracking-[-0.025em] text-[#202020]">
              오늘 {selectedRoutine?.title ?? '루틴'} 대신 가벼운
              <br />
              스트레칭 10분 어떠세요?
            </p>

            <div className="mt-5 grid grid-cols-3 gap-5">
              <div className="flex min-h-[82px] flex-col items-center justify-center rounded-[18px] border border-[#ebe8e1] bg-white px-2 text-center">
                <span className="text-[14px] font-medium text-[#696969]">예상 소요 시간</span>
                <strong className="mt-2 text-[24px] font-bold leading-none text-[#222]">10분</strong>
              </div>
              <div className="flex min-h-[82px] flex-col items-center justify-center rounded-[18px] border border-[#ebe8e1] bg-white px-2 text-center">
                <span className="text-[14px] font-medium text-[#696969]">난이도</span>
                <strong className="mt-2 text-[24px] font-bold leading-none text-[#222]">쉬움</strong>
              </div>
              <button
                aria-expanded={isMethodOpen}
                className="flex min-h-[82px] flex-col items-center justify-center rounded-[18px] border border-[#ebe8e1] bg-white px-2 text-center transition-colors hover:border-[#f0d36e] focus-visible:outline-2 focus-visible:outline-primary"
                onClick={() => setIsMethodOpen((current) => !current)}
                type="button"
              >
                <span className="text-[14px] font-medium text-[#696969]">수행 방법</span>
                <strong className="mt-2 max-w-full truncate text-[14px] font-semibold text-[#333]">가벼운 스트레칭</strong>
                <span className="mt-1 text-[12px] text-[#8a8a8a]">{isMethodOpen ? '접기' : '자세히 보기'}</span>
              </button>
            </div>

            <p className="sr-only">선택한 이유: {selectedReason}</p>
          </article>

          {isMethodOpen && (
            <div className="mt-6 rounded-[22px] border-2 border-[#f0d36e] bg-[#fffdf2] px-5 py-6 shadow-[0_4px_10px_rgba(187,144,36,0.08)]">
              <h2 className="text-[16px] font-semibold text-[#777268]">수행 방법</h2>
              <p className="mt-5 text-center text-[20px] font-bold text-[#222]">가벼운 스트레칭 + 호흡 운동</p>
              <p className="mt-5 text-center text-[14px] leading-[1.6] text-[#555]">
                목과 어깨를 천천히 풀어준 뒤, 깊게 숨을 들이마시고 내쉬는 동작을 반복해 주세요.
              </p>
            </div>
          )}

          <div className="ai-suggestion-actions mt-6 flex flex-col gap-4 px-10">
            <button className="min-h-[58px] rounded-[18px] bg-[#dff3d7] text-[16px] font-semibold text-[#303030]" onClick={handleAcceptMission} type="button">수락</button>
            <button className="min-h-[58px] rounded-[18px] bg-[#f7dfdf] text-[16px] font-semibold text-[#303030]" onClick={handleRejectMission} type="button">거절</button>
            <button className="min-h-[58px] rounded-[18px] bg-[#f0cf5c] text-[16px] font-semibold text-[#303030]" type="button">다른 제안 요청</button>
          </div>
        </div>
      )}
    </section>
  );
};

export default AiChatPage;

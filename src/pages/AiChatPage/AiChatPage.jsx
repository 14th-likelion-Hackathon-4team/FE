import { useEffect, useMemo, useState } from 'react';
import { FiChevronLeft, FiDroplet, FiHeart, FiSmile } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { readRoutineUpdate, saveRoutineUpdate } from '@/utils/routineUpdateStorage';
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authenticatedRequest = async (path, options = {}) => {
  const accessToken = localStorage.getItem('accessToken');

  if (!BASE_URL) throw new Error('API 서버 주소가 설정되지 않았습니다.');
  if (!accessToken) throw new Error('로그인이 필요합니다.');

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || '요청 처리 중 문제가 발생했습니다.');
  }

  return result?.data;
};

const getMyProfile = () => authenticatedRequest('/api/v1/routinefit/users/me');
const getMainPage = (userId) => authenticatedRequest(
  `/api/v1/routinefit/main?userId=${encodeURIComponent(userId)}`,
);
const startChat = (routineId) => authenticatedRequest(
  `/api/v1/routinefit/routines/${routineId}/chats`,
  { method: 'POST' },
);
const sendChatMessage = (currentChatId, message) => authenticatedRequest(
  `/api/v1/routinefit/chats/${currentChatId}/messages`,
  { method: 'POST', body: JSON.stringify(message) },
);
const generateMission = (currentChatId) => authenticatedRequest(
  `/api/v1/routinefit/chats/${currentChatId}/missions`,
  { method: 'POST' },
);
const handleMissionAction = (missionId, action) => authenticatedRequest(
  `/api/v1/routinefit/missions/${missionId}`,
  { method: 'PATCH', body: JSON.stringify({ action }) },
);

const reasons = ['피로', '시간부족', '기분', '기타'];
const causeTags = { 피로: 'FATIGUE', 시간부족: 'TIME_LACK', 기분: 'MOOD', 기타: 'OTHER' };
const difficultyLabels = { EASY: '쉬움', NORMAL: '보통', HARD: '어려움' };

const formatTime = (value) => {
  if (!value) return '--:--';
  if (typeof value === 'string') return value.slice(0, 5);
  return `${String(value.hour ?? 0).padStart(2, '0')}:${String(value.minute ?? 0).padStart(2, '0')}`;
};

const getRoutineVisual = (name = '') => {
  if (/물|수분/.test(name)) return { tone: 'blue', icon: FiDroplet };
  if (/스킨|약|케어/.test(name)) return { tone: 'red', icon: FiHeart };
  return { tone: 'green', icon: FiSmile };
};

const normalizeRoutine = (routine, savedRoutineUpdate) => {
  const routineId = routine.routineId ?? routine.id;
  const routineTitle = routine.routineName ?? routine.title;
  const savedUpdate = savedRoutineUpdate?.routineId === routineId
    ? savedRoutineUpdate
    : null;
  const status = routine.completed
    ? '완료'
    : (savedUpdate?.status ?? '대기');
  const title = savedUpdate?.kind === 'accepted' && savedUpdate.title
    ? savedUpdate.title
    : routineTitle;

  return {
    id: routineId,
    title,
    time: formatTime(routine.scheduledTime ?? routine.performTime),
    status,
    ...getRoutineVisual(title),
  };
};

const getUnavailableRoutineMessage = (status) => {
  if (status === '대체 미션 진행중') return '이미 진행 중인 대체 미션이 있습니다.';
  if (status === '미완료') return '이미 미완료 처리된 루틴입니다.';
  return '이미 완료된 루틴입니다.';
};

const toneStyles = {
  green: 'bg-[#d9f2d5] text-[#67bb82]',
  blue: 'bg-[#dcebff] text-[#7baded]',
  red: 'bg-[#f9dfdf] text-[#e78d84]',
};

const RoutineOption = ({ icon: Icon, isSelected, isUnavailable, onSelect, status, time, title, tone }) => (
  <button
    aria-disabled={isUnavailable}
    aria-pressed={isSelected}
    className={`grid min-h-[70px] w-full grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-[18px] border px-3 text-left transition active:scale-[0.99] aria-disabled:cursor-not-allowed aria-disabled:opacity-60 ${isSelected ? 'border-2 border-[#f0ca55] bg-[#fffdf2] shadow-[0_0_0_3px_rgba(246,201,76,0.1)]' : 'border-[#ebe8e1] bg-white'}`}
    onClick={onSelect}
    type="button"
  >
    <span className={`flex size-11 items-center justify-center rounded-2xl ${toneStyles[tone]}`}>
      <Icon aria-hidden="true" className="size-7" strokeWidth={2.4} />
    </span>
    <span className="min-w-0">
      <strong className="block truncate text-[16px] font-bold text-[#292929]">{title}</strong>
      <span className="mt-1 block text-[14px] text-[#8d8d8d]">{time}</span>
    </span>
    <span className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-semibold ${status === '완료' ? 'bg-[#d9f2d5] text-[#64a56e]' : 'bg-[#ececec] text-[#777]'}`}>
      {status}
    </span>
  </button>
);

const StepButtons = ({ isLoading = false, isNextDisabled, onBack, onNext }) => (
  <div className="mt-8 grid grid-cols-2 gap-10 px-2">
    <button className="min-h-[52px] rounded-xl border border-[#e4e4e4] bg-white text-[16px] font-semibold" onClick={onBack} type="button">뒤로</button>
    <button className="min-h-[52px] rounded-xl bg-[#f4cf56] text-[16px] font-semibold disabled:bg-[#ececec] disabled:text-[#999]" disabled={isNextDisabled || isLoading} onClick={onNext} type="button">
      {isLoading ? '처리 중...' : '다음'}
    </button>
  </div>
);

const CoachHeader = ({ children }) => (
  <>
    <h1 className="flex h-11 items-center justify-center text-[24px] font-extrabold">AI 코치</h1>
    <div className="mt-5 flex w-full flex-col items-center">
      <img alt="AI 코치 햄스터" className="h-[112px] w-auto object-contain" src="/assets/images/hamster.png" />
      {children}
    </div>
  </>
);

const AiChatPage = () => {
  const navigate = useNavigate();
  const [screen, setScreen] = useState('start');
  const [userName, setUserName] = useState('');
  const [routines, setRoutines] = useState([]);
  const [selectedRoutineId, setSelectedRoutineId] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState('');
  const [notice, setNotice] = useState('');
  const [chatId, setChatId] = useState(null);
  const [mission, setMission] = useState(null);
  const [proposalIndex, setProposalIndex] = useState(0);
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const [isRoutineLoading, setIsRoutineLoading] = useState(false);
  const [isMissionLoading, setIsMissionLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const selectedRoutine = routines.find(({ id }) => id === selectedRoutineId);
  const proposal = useMemo(() => mission ? {
    duration: `${mission.durationMinutes ?? 0}분`,
    difficulty: difficultyLabels[mission.difficulty] ?? mission.difficulty ?? '보통',
    content: mission.content,
  } : null, [mission]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = window.setTimeout(() => setNotice(''), 3000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const resetFlow = () => {
    setScreen('start');
    setSelectedRoutineId(null);
    setSelectedReason(null);
    setCustomReason('');
    setChatId(null);
    setMission(null);
    setProposalIndex(0);
    setIsMethodOpen(false);
    setNotice('');
  };

  const handleStart = async () => {
    setIsRoutineLoading(true);
    try {
      const profile = await getMyProfile();
      const mainData = await getMainPage(profile.id);
      const routineList = mainData?.todayRoutines ?? [];
      const savedRoutineUpdate = readRoutineUpdate();

      setUserName(profile?.nickname ?? '회원');
      setRoutines(
        routineList.map((routine) => normalizeRoutine(routine, savedRoutineUpdate)),
      );
      setScreen('select');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setIsRoutineLoading(false);
    }
  };

  const handleCreateSuggestion = async (reasonContent) => {
    if (!selectedRoutine) return;
    if (!selectedRoutine.id) {
      setNotice('루틴 정보를 확인할 수 없어 대화를 시작할 수 없습니다.');
      return;
    }
    setIsMissionLoading(true);
    try {
      let nextChatId = chatId;
      if (!nextChatId) {
        const chat = await startChat(selectedRoutine.id);
        nextChatId = chat?.chatId;
        if (!nextChatId) throw new Error('대화 정보를 확인할 수 없습니다.');
        setChatId(nextChatId);
      }
      await sendChatMessage(nextChatId, {
        content: reasonContent,
        causeTag: causeTags[selectedReason] ?? 'OTHER',
      });
      const result = await generateMission(nextChatId);
      if (!result?.mission) throw new Error('대체 미션을 생성하지 못했습니다.');
      setMission(result.mission);
      setProposalIndex(0);
      setIsMethodOpen(false);
      setScreen('suggestion');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setIsMissionLoading(false);
    }
  };

  const handleAnotherMission = async () => {
    if (!chatId) return;
    setIsMissionLoading(true);
    try {
      const result = await generateMission(chatId);
      if (!result?.mission) throw new Error('다른 미션을 생성하지 못했습니다.');
      setMission(result.mission);
      setProposalIndex(1);
      setIsMethodOpen(false);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setIsMissionLoading(false);
    }
  };

  const handleDecision = async (action) => {
    if (!mission?.missionId || isActionLoading) return;
    setIsActionLoading(true);
    try {
      await handleMissionAction(mission.missionId, action);
      const isAccepted = action === 'ACCEPT';
      const routineUpdate = {
        kind: isAccepted ? 'accepted' : 'rejected',
        missionId: mission.missionId,
        missionType: /물|수분/.test(mission.content) ? 'water' : 'exercise',
        routineId: selectedRoutine.id,
        status: isAccepted ? '대체 미션 진행중' : '미완료',
        time: selectedRoutine.time,
        title: isAccepted ? mission.content : selectedRoutine.title,
      };
      saveRoutineUpdate(routineUpdate);
      navigate('/', {
        state: { routineUpdate },
      });
    } catch (error) {
      setNotice(error.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleHeaderBack = () => {
    if (screen === 'start') navigate(-1);
    else resetFlow();
  };

  const handleBack = () => {
    if (screen === 'suggestion') setScreen('reason');
    else if (screen === 'custom-reason') { setScreen('reason'); setSelectedReason(null); setCustomReason(''); }
    else if (screen === 'reason') { setScreen('select'); setSelectedReason(null); }
    else if (screen === 'select') resetFlow();
    else navigate(-1);
  };

  return (
    <section className="font-pretendard relative mx-auto min-h-[calc(100dvh-82px-env(safe-area-inset-bottom))] w-full max-w-[430px] self-start overflow-x-hidden">
      <button aria-label="이전 화면으로 돌아가기" className="absolute left-0 top-5 z-10 flex size-11 items-center justify-center rounded-full text-[#2c2c2c]" onClick={handleHeaderBack} type="button">
        <FiChevronLeft className="size-10" strokeWidth={3} />
      </button>

      {notice && <div aria-live="polite" className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center px-6"><p className="ai-selection-toast rounded-full bg-[#333]/90 px-6 py-3 text-center text-[16px] font-semibold text-white">{notice}</p></div>}

      {screen === 'start' && (
        <div className="flex min-h-[calc(100dvh-82px-env(safe-area-inset-bottom))] items-center justify-center">
          <div className="flex -translate-y-6 flex-col items-center">
            <img alt="아이디어를 떠올린 AI 코치 햄스터" className="-mb-7 h-[190px] w-auto -translate-x-2 object-contain" src="/assets/images/hamster-lightbulb.png" />
            <button className="min-h-[60px] w-[200px] rounded-full bg-[#f4cf56] text-[20px] font-bold shadow-[0_5px_12px_rgba(187,144,36,0.2)] disabled:opacity-60" disabled={isRoutineLoading} onClick={handleStart} type="button">
              {isRoutineLoading ? '불러오는 중...' : '대화 시작하기'}
            </button>
          </div>
        </div>
      )}

      {screen === 'select' && (
        <div className="mx-auto flex w-full max-w-[390px] flex-col px-1 pb-8 pt-5">
          <CoachHeader>
            <p className="mt-4 flex w-full flex-col items-center gap-1 px-3 text-center text-[20px] font-semibold leading-[1.35] tracking-[-0.025em]">
              <span className="whitespace-nowrap">
                안녕하세요, {userName || '회원'}님! <span aria-hidden="true">👋</span>
              </span>
              <span>무엇을 도와드릴까요?</span>
            </p>
          </CoachHeader>
          <p className="mb-3 mt-8 text-[14px] font-medium text-[#8a8a8a]">상담할 루틴을 선택해주세요</p>
          <div className="ai-select-items flex flex-col gap-3">
            {routines.length === 0 && <p className="py-14 text-center text-[16px] text-[#888]">현재 등록된 루틴이 없습니다.</p>}
            {routines.map((routine) => {
              const isUnavailable = routine.status !== '대기';
              return <RoutineOption {...routine} isSelected={selectedRoutineId === routine.id} isUnavailable={isUnavailable} key={routine.id} onSelect={() => {
                if (isUnavailable) {
                  setNotice(getUnavailableRoutineMessage(routine.status));
                  return;
                }
                setSelectedRoutineId((current) => current === routine.id ? null : routine.id);
              }} />;
            })}
          </div>
          <StepButtons isNextDisabled={!selectedRoutineId} onBack={handleBack} onNext={() => setScreen('reason')} />
        </div>
      )}

      {screen === 'reason' && (
        <div className="mx-auto flex w-full max-w-[390px] flex-col px-1 pb-8 pt-5">
          <CoachHeader><p className="mt-4 text-center text-[20px] font-semibold">루틴을 어떻게 못 지키게 되었나요?</p></CoachHeader>
          <div className="ai-select-items mt-12 flex flex-col gap-5 px-8">
            {reasons.map((reason) => <button aria-pressed={selectedReason === reason} className={`min-h-[70px] rounded-[18px] border text-[16px] font-semibold ${selectedReason === reason ? 'border-2 border-[#f0ca55] bg-[#fffdf2]' : 'border-[#e9e6df] bg-white'}`} key={reason} onClick={() => {
              if (reason === '기타') { setSelectedReason('기타'); setScreen('custom-reason'); }
              else setSelectedReason((current) => current === reason ? null : reason);
            }} type="button">{reason}</button>)}
          </div>
          <StepButtons isLoading={isMissionLoading} isNextDisabled={!selectedReason} onBack={handleBack} onNext={() => handleCreateSuggestion(selectedReason)} />
        </div>
      )}

      {screen === 'custom-reason' && (
        <div className="mx-auto flex w-full max-w-[390px] flex-col px-1 pb-8 pt-5">
          <CoachHeader><p className="mt-4 text-center text-[20px] font-semibold">이유를 입력해주세요.</p></CoachHeader>
          <label className="sr-only" htmlFor="custom-reason">루틴을 지키기 어려운 이유</label>
          <textarea autoFocus className="mt-6 min-h-[220px] w-full resize-none rounded-[20px] border border-[#e7e3da] bg-white p-5 text-[16px] leading-[1.6] outline-none focus:border-[#f0cf5c]" id="custom-reason" maxLength={300} onChange={(event) => setCustomReason(event.target.value)} placeholder="이유를 자유롭게 입력해주세요." value={customReason} />
          <StepButtons isLoading={isMissionLoading} isNextDisabled={!customReason.trim()} onBack={handleBack} onNext={() => handleCreateSuggestion(customReason.trim())} />
        </div>
      )}

      {screen === 'suggestion' && proposal && (
        <div className="mx-auto flex w-full max-w-[430px] flex-col pb-8 pt-5" key={mission.missionId}>
          <h1 className="flex h-11 items-center justify-center text-[24px] font-extrabold">AI 코치</h1>
          <div className="mt-5 flex justify-end px-3"><div className="flex size-[64px] items-center justify-center overflow-hidden rounded-full bg-[#e5e5e5]"><img alt="AI 코치 햄스터" className="h-[72px] w-auto max-w-none object-contain" src="/assets/images/hamster.png" /></div></div>
          <div className="ai-message-pop mt-4 w-full max-w-[340px] rounded-[18px] border border-[#ebe8e1] bg-white px-4 py-6"><p className="break-keep text-[14px] font-medium">{proposalIndex === 0 ? '괜찮아요! 대체할 수 있는 방법을 제안해줄게요.' : '다른 방법을 제안해줄게요.'}</p></div>
          <article className="ai-proposal-pop mt-5 rounded-[22px] border-2 border-[#f0d36e] bg-[#fffdf2] px-5 pb-6 pt-5">
            <h2 className="text-[16px] font-semibold text-[#777268]">✨ 대체 제안</h2>
            <p className="mt-5 break-keep text-[20px] font-bold leading-[1.35]">{proposal.content}</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="flex min-h-[82px] flex-col items-center justify-center rounded-[18px] border border-[#ebe8e1] bg-white text-center"><span className="text-[14px] text-[#696969]">예상 소요 시간</span><strong className="mt-2 text-[24px]">{proposal.duration}</strong></div>
              <div className="flex min-h-[82px] flex-col items-center justify-center rounded-[18px] border border-[#ebe8e1] bg-white text-center"><span className="text-[14px] text-[#696969]">난이도</span><strong className="mt-2 text-[24px]">{proposal.difficulty}</strong></div>
              <button aria-expanded={isMethodOpen} className="flex min-h-[82px] flex-col items-center justify-center rounded-[18px] border border-[#ebe8e1] bg-white px-2 text-center" onClick={() => setIsMethodOpen((value) => !value)} type="button"><span className="text-[14px] text-[#696969]">수행 방법</span><strong className="mt-2 max-w-full truncate text-[14px]">{proposal.content}</strong><span className="mt-1 text-[12px] text-[#8a8a8a]">{isMethodOpen ? '접기' : '자세히 보기'}</span></button>
            </div>
          </article>
          {isMethodOpen && <div className="mt-6 rounded-[22px] border-2 border-[#f0d36e] bg-[#fffdf2] px-5 py-6"><h2 className="text-[16px] font-semibold text-[#777268]">수행 방법</h2><p className="mt-5 break-keep text-center text-[20px] font-bold">{proposal.content}</p><p className="mx-auto mt-5 max-w-[340px] break-keep text-center text-[14px] leading-[1.7] text-[#555]">제안된 미션을 무리하지 않는 범위에서 천천히 수행해주세요.</p></div>}
          <div className="ai-suggestion-actions mt-6 flex flex-col gap-4 px-10">
            <button className="min-h-[58px] rounded-[18px] bg-[#dff3d7] text-[16px] font-semibold disabled:opacity-60" disabled={isActionLoading} onClick={() => handleDecision('ACCEPT')} type="button">{isActionLoading ? '처리 중...' : '수락'}</button>
            <button className="min-h-[58px] rounded-[18px] bg-[#f7dfdf] text-[16px] font-semibold disabled:opacity-60" disabled={isActionLoading} onClick={() => handleDecision('REJECT')} type="button">거절</button>
            {proposalIndex === 0 && <button className="min-h-[58px] rounded-[18px] bg-[#f0cf5c] text-[16px] font-semibold disabled:opacity-60" disabled={isMissionLoading} onClick={handleAnotherMission} type="button">{isMissionLoading ? '제안 생성 중...' : '다른 제안 요청'}</button>}
          </div>
        </div>
      )}
    </section>
  );
};

export default AiChatPage;

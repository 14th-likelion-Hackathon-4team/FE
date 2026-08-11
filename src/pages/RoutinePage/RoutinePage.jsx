import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RoutineActionSheet from './components/RoutineActionSheet';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import RoutineList from './components/RoutineList';
import RoutineToast from './components/RoutineToast';

const initialRoutines = [
  { id: 1, name: '아침 스트레칭', repeatType: 'days', days: ['월', '수', '금'], time: '07:30', startDate: '2026-08-03', endDate: '', notificationEnabled: true, notificationTiming: '정시', active: true },
  { id: 2, name: '영어 단어 복습', repeatType: 'daily', days: [], time: '15:00', startDate: '2026-08-03', endDate: '', notificationEnabled: true, notificationTiming: '10분 전', active: false },
  { id: 3, name: '저녁 산책', repeatType: 'days', days: ['월', '화', '수', '목', '금', '토', '일'], time: '20:00', startDate: '2026-08-03', endDate: '2026-08-31', notificationEnabled: true, notificationTiming: '정시', active: true },
  { id: 4, name: '하루 회고', repeatType: 'days', days: ['화', '목'], time: '23:00', startDate: '2026-08-03', endDate: '', notificationEnabled: false, notificationTiming: '정시', active: true },
];

const RoutinePage = () => {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState(initialRoutines);
  const [selectedDay, setSelectedDay] = useState('전체');
  const [actionRoutineId, setActionRoutineId] = useState(null);
  const [deleteRoutineId, setDeleteRoutineId] = useState(null);
  const [deletedRoutine, setDeletedRoutine] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  const actionRoutine = routines.find((routine) => routine.id === actionRoutineId) ?? null;
  const deleteRoutine = routines.find((routine) => routine.id === deleteRoutineId) ?? null;
  const filteredRoutines = useMemo(
    () => routines.filter((routine) => selectedDay === '전체' || routine.repeatType === 'daily' || routine.days.includes(selectedDay)).toSorted((first, second) => first.time.localeCompare(second.time)),
    [routines, selectedDay],
  );

  useEffect(() => {
    if (!toastVisible) return undefined;
    const timeoutId = window.setTimeout(() => setToastVisible(false), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [toastVisible]);

  const handleOpenCreate = () => navigate('/routines/new');
  const handleOpenDetail = (routineId) => navigate(`/routines/${routineId}`);
  const handleOpenEdit = (routineId) => { setActionRoutineId(null); navigate(`/routines/${routineId}/edit`); };
  const handleToggleRoutine = (routineId) => setRoutines((items) => items.map((routine) => routine.id === routineId ? { ...routine, active: !routine.active } : routine));

  const handleRequestDelete = (routineId) => {
    setActionRoutineId(null);
    setDeleteRoutineId(routineId);
  };

  const handleConfirmDelete = () => {
    const routineId = deleteRoutineId;
    const index = routines.findIndex((routine) => routine.id === routineId);
    const routine = routines[index];
    if (!routine) return;
    setDeletedRoutine({ index, routine });
    setRoutines((items) => items.filter((item) => item.id !== routineId));
    setActionRoutineId(null);
    setDeleteRoutineId(null);
    setToastVisible(true);
  };

  const handlePauseInstead = () => {
    if (deleteRoutineId) {
      handleToggleRoutine(deleteRoutineId);
    }
    setDeleteRoutineId(null);
  };

  const handleUndoDelete = () => {
    if (!deletedRoutine) return;
    setRoutines((items) => { const restored = [...items]; restored.splice(deletedRoutine.index, 0, deletedRoutine.routine); return restored; });
    setDeletedRoutine(null);
    setToastVisible(false);
  };

  return <><RoutineList onOpenActions={setActionRoutineId} onOpenCreate={handleOpenCreate} onSelectDay={setSelectedDay} onSelectRoutine={handleOpenDetail} onToggleRoutine={handleToggleRoutine} routines={filteredRoutines} selectedDay={selectedDay} /><RoutineActionSheet onClose={() => setActionRoutineId(null)} onDelete={handleRequestDelete} onEdit={handleOpenEdit} onToggleActive={handleToggleRoutine} routine={actionRoutine} /><DeleteConfirmDialog onCancel={() => setDeleteRoutineId(null)} onConfirm={handleConfirmDelete} onPause={handlePauseInstead} routine={deleteRoutine} /><RoutineToast onUndo={handleUndoDelete} visible={toastVisible} /></>;
};

export default RoutinePage;

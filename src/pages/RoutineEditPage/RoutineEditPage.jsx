import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DeleteConfirmDialog from '@/pages/RoutinePage/components/DeleteConfirmDialog';
import RoutineForm from '@/pages/RoutinePage/components/RoutineForm';

const editTargetRoutine = {
  id: 1,
  name: '아침 스트레칭',
  repeatType: 'days',
  days: ['월', '수', '금'],
  time: '07:30',
  startDate: '2026-08-03',
  endDate: '',
  notificationEnabled: true,
  notificationTiming: '정시',
  active: true,
};

const RoutineEditPage = () => {
  const { routineId } = useParams();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleClose = () => navigate(`/routines/${routineId}`);

  return (
    <>
      <RoutineForm
        initialRoutine={editTargetRoutine}
        mode="edit"
        onCancel={handleClose}
        onDelete={() => setDeleteOpen(true)}
        onSave={handleClose}
      />
      <DeleteConfirmDialog
        onCancel={() => setDeleteOpen(false)}
        onConfirm={() => navigate('/routines', { replace: true })}
        onPause={() => setDeleteOpen(false)}
        routine={deleteOpen ? editTargetRoutine : null}
      />
    </>
  );
};

export default RoutineEditPage;

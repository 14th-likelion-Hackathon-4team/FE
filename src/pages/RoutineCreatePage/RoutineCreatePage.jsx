import { useNavigate } from 'react-router-dom';
import RoutineForm from '@/pages/RoutinePage/components/RoutineForm';

const emptyRoutine = {
  name: '',
  repeatType: 'days',
  days: ['월', '수', '금'],
  time: '07:30',
  startDate: '2026-08-03',
  endDate: '',
  notificationEnabled: true,
  notificationTiming: '정시',
  active: true,
};

const RoutineCreatePage = () => {
  const navigate = useNavigate();
  const handleClose = () => navigate('/routines');

  return <RoutineForm initialRoutine={emptyRoutine} mode="create" onCancel={handleClose} onSave={handleClose} />;
};

export default RoutineCreatePage;

import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RoutineForm from '@/pages/RoutinePage/components/RoutineForm';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const longDayCodes = {
  월: 'MON',
  화: 'TUE',
  수: 'WED',
  목: 'THU',
  금: 'FRI',
  토: 'SAT',
  일: 'SUN',
};

const repeatTypeCodes = {
  days: 'WEEKLY',
  daily: 'DAILY',
  count: 'COUNT',
};

const toTimeWithSeconds = (time) => (time ? `${time}:00` : null);

const calculateAlarmTime = (performTime, notificationTiming) => {
  if (!performTime) return null;

  const minutesBefore = {
    정시: 0,
    '10분 전': 10,
    '30분 전': 30,
  }[notificationTiming];
  const [hour, minute] = performTime.split(':').map(Number);
  const alarmMinutes = (hour * 60 + minute - minutesBefore + 24 * 60) % (24 * 60);

  return `${String(Math.floor(alarmMinutes / 60)).padStart(2, '0')}:${String(alarmMinutes % 60).padStart(2, '0')}:00`;
};

const getRepeatValues = (routine) => {
  if (routine.repeatType === 'daily') {
    return {
      repeatDays: 'MON,TUE,WED,THU,FRI,SAT,SUN',
      repeatCount: null,
    };
  }

  if (routine.repeatType === 'count') {
    return {
      repeatDays: null,
      repeatCount: Number(routine.repeatCount),
    };
  }

  return {
    repeatDays: routine.days.map((day) => longDayCodes[day]).join(','),
    repeatCount: null,
  };
};

const RoutineCreatePage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleClose = () => navigate('/routines');

  const handleSave = async (routine) => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setSubmitError('로그인 정보가 없습니다. 다시 로그인해주세요.');
      return;
    }

    const repeatValues = getRepeatValues(routine);
    const requestBody = {
      title: routine.name.trim(),
      performTime: toTimeWithSeconds(routine.time),
      repeatDays: repeatValues.repeatDays,
      alarm: routine.notificationEnabled,
      active: true,
      startDate: routine.startDate,
      endDate: routine.endDate || null,
      alarmTime: routine.notificationEnabled
        ? calculateAlarmTime(routine.time, routine.notificationTiming)
        : null,
      repeatType: repeatTypeCodes[routine.repeatType],
      repeatCount: repeatValues.repeatCount,
    };

    setIsSubmitting(true);
    setSubmitError('');

    try {
      await axios.post(`${BASE_URL}/api/v1/routinefit/routines`, requestBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      navigate('/routines', { replace: true });
    } catch (error) {
      const status = error.response?.status;
      const serverMessage = error.response?.data?.message;

      if (status === 400) {
        setSubmitError(serverMessage || '입력한 루틴 정보를 확인해주세요.');
      } else if (status === 401) {
        setSubmitError('로그인이 만료되었습니다. 다시 로그인해주세요.');
      } else {
        setSubmitError(serverMessage || '루틴을 생성하지 못했습니다.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RoutineForm
      isSubmitting={isSubmitting}
      mode="create"
      onCancel={handleClose}
      onSave={handleSave}
      submitError={submitError}
    />
  );
};

export default RoutineCreatePage;

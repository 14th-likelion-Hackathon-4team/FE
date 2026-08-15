const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authenticatedRequest = async (path, options = {}) => {
  const accessToken = localStorage.getItem('accessToken');

  if (!BASE_URL) throw new Error('API 서버 주소가 설정되지 않았습니다.');
  if (!accessToken) throw new Error('로그인이 필요합니다.');

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });
  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(result?.message || '요청 처리 중 문제가 발생했습니다.');
  }

  return result?.data;
};

export const getMainPage = () => authenticatedRequest('/api/v1/routinefit/main');

export const completeRoutine = (routineId) => authenticatedRequest(
  `/api/v1/routinefit/routines/${routineId}/complete`,
  { method: 'PATCH' },
);
export const getMyProfile = () => authenticatedRequest('/api/v1/routinefit/users/me');

export const getTodayNotifications = (userId) => authenticatedRequest(
  `/api/v1/routinefit/main/notifications/today?userId=${encodeURIComponent(userId)}`,
);

export const readNotification = (notificationId) => authenticatedRequest(
  `/api/v1/routinefit/main/notifications/${notificationId}/read`,
  { method: 'PATCH' },
);

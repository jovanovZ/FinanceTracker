import apiClient from './api.js';

export const getDashboardStats  = () => apiClient.get('/analytics/dashboard');
export const getMonthlyTrends   = () => apiClient.get('/analytics/trends');
export const getTopMerchants    = () => apiClient.get('/analytics/top-merchants');
export const getDailySpending   = () => apiClient.get('/analytics/daily-spending');
export const getInsights        = () => apiClient.get('/analytics/insights');
// export const getTopCategories     = () => apiClient.get('/analytics/top-categories');
// export const getWeekendVsWeekday  = () => apiClient.get('/analytics/weekend-vs-weekday');
// export const getBiggestExpense    = () => apiClient.get('/analytics/biggest-expense');
// export const getTopMerchant       = () => apiClient.get('/analytics/top-merchant');
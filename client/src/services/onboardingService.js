import apiClient from './api.js';

const onboardingService = {
  async complete({ persona, goals, currency, monthlyBudget }) {
    const response = await apiClient.patch('/auth/onboarding', {
      persona,
      goals,
      currency,
      monthlyBudget,
    });
    return response; // { success, user }
  },
};

export default onboardingService;

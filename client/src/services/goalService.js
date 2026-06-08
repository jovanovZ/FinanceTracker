// Savings goals API — wired to the backend goalsController (/goals).
// Backend returns each goal with computed stats (progress, remainingAmount,
// monthlyContribution), so the UI just displays them.
import apiClient from './api.js'

export function getGoals() {
  return apiClient.get('/goals')
}

export function createGoal(data) {
  return apiClient.post('/goals', data)
}

export function updateGoal(id, patch) {
  return apiClient.patch(`/goals/${id}`, patch)
}

export function deleteGoal(id) {
  return apiClient.delete(`/goals/${id}`)
}

import apiClient from './api.js'

function formatLastActive(dateStr) {
  if (!dateStr) return 'Unknown'
  const date = new Date(dateStr)
  const diffMs = Date.now() - date
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins} min ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'yesterday'
  return `${diffDays} days ago`
}

function transformProfile(data) {
  return {
    ...data,
    memberSince: data.memberSince || data.createdAt,
    sessions: (data.sessions || []).map((s) => ({
      ...s,
      lastActive: formatLastActive(s.lastActive),
    })),
  }
}

export async function getProfile() {
  const data = await apiClient.get('/profile')
  return transformProfile(data)
}

export async function updateProfile(patch) {
  const data = await apiClient.patch('/profile', patch)
  return transformProfile(data)
}

export async function changePassword(currentPassword, newPassword) {
  await apiClient.post('/auth/change-password', { currentPassword, newPassword })
}

export async function getSessions() {
  const data = await apiClient.get('/auth/sessions')
  return (data.sessions || []).map((s) => ({
    ...s,
    lastActive: formatLastActive(s.lastActive),
  }))
}

export async function terminateSession(id) {
  const data = await apiClient.delete(`/auth/sessions/${id}`)
  return (data.sessions || []).map((s) => ({
    ...s,
    lastActive: formatLastActive(s.lastActive),
  }))
}

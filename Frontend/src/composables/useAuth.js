import { ref, readonly } from 'vue'

const user = ref(window.__USER__ ?? null)

export function useAuth() {
  function setUser(username) {
    user.value = username
    window.__USER__ = username
  }

  function setUserFromServer(username) {
    setUser(username)
  }

  function clearUser() {
    user.value = null
    window.__USER__ = null
  }

  async function login(username, password) {
    const body = new URLSearchParams({ username, password })
    const response = await fetch('/login', {
      method: 'POST',
      body,
      credentials: 'include',
      redirect: 'manual',
    })

    if (response.type === 'opaqueredirect' || response.status === 302 || response.ok) {
      setUser(username)
      return { success: true }
    }

    if (response.status === 401) {
      return { success: false, error: 'Invalid username or password.' }
    }

    const text = await response.text()
    return { success: false, error: text || 'Login failed. Please try again.' }
  }

  async function logout() {
    await fetch('/logout', { credentials: 'include' })
    clearUser()
  }

  return {
    user: readonly(user),
    login,
    logout,
    setUserFromServer,
    isAuthenticated: () => !!user.value,
  }
}

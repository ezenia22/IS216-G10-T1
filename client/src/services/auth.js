import { ref, computed } from 'vue'
import api, { authApi, tokenStore } from './api.js'

export const currentUser = ref(null) // null = logged out
export const isOwner = computed(() => currentUser.value?.role === 'owner')
export const isSitter = computed(() => currentUser.value?.role === 'sitter')

function startSession({ token, ...user }) {
  tokenStore.set(token)
  currentUser.value = user
}

function clearSession() {
  tokenStore.clear()
  currentUser.value = null
}

export async function login(creds) {
  startSession(await authApi.login(creds))
}

export async function register(form) {
  startSession(await authApi.register(form))
}

// Restores the logged-in user after a page refresh. Runs once; the router waits for it.
let loading = null
export function fetchUser() {
  if (!loading) {
    loading = (async () => {
      if (!tokenStore.get()) return
      try {
        currentUser.value = await authApi.me()
      } catch {
        clearSession()
      }
    })()
  }
  return loading
}

export async function logout() {
  try {
    await authApi.logout()
  } catch {
    // ignore — logging out locally is what matters
  }
  clearSession()
}

// If the token expires mid-session, any 401 logs the user out locally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && tokenStore.get()) clearSession()
    return Promise.reject(err)
  }
)
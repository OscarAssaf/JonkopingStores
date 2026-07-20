<script setup>
import { onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import { useAuth } from './composables/useAuth'

const { setUserFromServer } = useAuth()

onMounted(async () => {
  if (window.__USER__ != null) return

  try {
    const response = await fetch('/api/auth', { credentials: 'include' })
    if (response.ok) {
      const { user } = await response.json()
      if (user) setUserFromServer(user)
    }
  } catch {
    // Auth check is optional on first load
  }
})
</script>

<template>
  <div class="app">
    <AppHeader />
    <main class="main">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

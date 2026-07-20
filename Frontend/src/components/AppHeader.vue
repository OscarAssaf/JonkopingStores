<script setup>
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'

const { user, logout } = useAuth()
const router = useRouter()

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>

<template>
  <header class="header">
    <div class="header__inner container">
      <RouterLink to="/" class="header__brand">
        <span class="header__logo">JC</span>
        <span class="header__title">Jönköping City</span>
      </RouterLink>

      <nav class="header__nav">
        <RouterLink to="/" class="header__link">Stores</RouterLink>
        <RouterLink v-if="user" to="/add" class="header__link">Add Store</RouterLink>
      </nav>

      <div class="header__actions">
        <template v-if="user">
          <span class="header__greeting">Hello, {{ user }}</span>
          <button type="button" class="btn btn--ghost btn--sm" @click="handleLogout">
            Log out
          </button>
        </template>
        <RouterLink v-else to="/login" class="btn btn--primary btn--sm">
          Admin login
        </RouterLink>
      </div>
    </div>
  </header>
</template>

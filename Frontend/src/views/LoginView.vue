<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const route = useRoute()
const { login } = useAuth()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleSubmit() {
  error.value = ''
  loading.value = true

  try {
    const result = await login(username.value, password.value)
    if (result.success) {
      const redirect = route.query.redirect || '/'
      router.push(typeof redirect === 'string' ? redirect : '/')
    } else {
      error.value = result.error
    }
  } catch {
    error.value = 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="auth-page">
    <div class="auth-card">
      <div class="auth-card__header">
        <span class="auth-card__icon">🔐</span>
        <h1>Admin login</h1>
        <p>Sign in to manage store listings</p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div v-if="error" class="auth-form__error" role="alert">{{ error }}</div>

        <div class="form-field">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-field">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
          />
        </div>

        <button type="submit" class="btn btn--primary btn--full" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <p class="auth-card__footer">
        <RouterLink to="/">&larr; Back to stores</RouterLink>
      </p>
    </div>
  </section>
</template>

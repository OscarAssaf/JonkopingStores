<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import StoreForm from '../components/StoreForm.vue'

const router = useRouter()
const submitting = ref(false)
const error = ref('')

async function handleSubmit(formData) {
  submitting.value = true
  error.value = ''

  try {
    const response = await fetch('/api/stores', {
      method: 'POST',
      body: formData,
      credentials: 'include',
      redirect: 'manual',
    })

    if (
      response.type === 'opaqueredirect' ||
      response.status === 302 ||
      response.ok
    ) {
      router.push('/')
      return
    }

    if (response.status === 401 || response.status === 403) {
      router.push('/login')
      return
    }

    error.value = 'Could not add store. Please check your input and try again.'
  } catch {
    error.value = 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="form-page">
    <div class="form-page__inner container--narrow">
      <div class="section-heading">
        <h1>Add a new store</h1>
        <p>Fill in the details below to list a new shop in Jönköping city centre.</p>
      </div>

      <div v-if="error" class="form-page__error" role="alert">{{ error }}</div>

      <StoreForm submit-label="Add store" :loading="submitting" @submit="handleSubmit" />

      <p class="form-page__back">
        <RouterLink to="/">&larr; Back to stores</RouterLink>
      </p>
    </div>
  </section>
</template>

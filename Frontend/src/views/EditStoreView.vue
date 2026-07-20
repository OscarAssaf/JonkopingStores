<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StoreForm from '../components/StoreForm.vue'

const route = useRoute()
const router = useRouter()

const store = ref(null)
const loading = ref(true)
const submitting = ref(false)
const error = ref('')

onMounted(async () => {
  try {
    const response = await fetch('/api/stores')
    if (!response.ok) throw new Error('Failed to load store')
    const stores = await response.json()
    store.value = stores.find((s) => s.id === Number(route.params.id)) ?? null
    if (!store.value) error.value = 'Store not found.'
  } catch {
    error.value = 'Could not load store data.'
  } finally {
    loading.value = false
  }
})

async function handleSubmit(formData) {
  submitting.value = true
  error.value = ''

  try {
    const response = await fetch(`/api/stores/${route.params.id}?_method=PUT`, {
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

    error.value = 'Could not update store. Please try again.'
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
        <h1>Edit store</h1>
        <p>Update the listing details for this shop.</p>
      </div>

      <div v-if="loading" class="state-message">
        <div class="spinner"></div>
        <p>Loading store...</p>
      </div>

      <template v-else-if="store">
        <div v-if="error" class="form-page__error" role="alert">{{ error }}</div>

        <StoreForm
          :initial="store"
          submit-label="Save changes"
          :loading="submitting"
          @submit="handleSubmit"
        />
      </template>

      <div v-else class="state-message state-message--error">
        <p>{{ error || 'Store not found.' }}</p>
        <RouterLink to="/" class="btn btn--primary">Back to stores</RouterLink>
      </div>

      <p v-if="store" class="form-page__back">
        <RouterLink to="/">&larr; Back to stores</RouterLink>
      </p>
    </div>
  </section>
</template>

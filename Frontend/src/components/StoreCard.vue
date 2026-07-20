<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const props = defineProps({
  store: { type: Object, required: true },
})

const emit = defineEmits(['delete'])

const { user } = useAuth()
const router = useRouter()

const websiteUrl = computed(() => {
  if (!props.store.url) return null
  return props.store.url.startsWith('http') ? props.store.url : `https://${props.store.url}`
})

const priceLabel = computed(() => {
  const map = { $: 'Budget-friendly', $$: 'Mid-range', $$$: 'Premium' }
  return map[props.store.price_range] || props.store.price_range || 'Not listed'
})

function editStore() {
  router.push(`/edit/${props.store.id}`)
}

function confirmDelete() {
  if (window.confirm(`Delete "${props.store.name}"? This cannot be undone.`)) {
    emit('delete', props.store.id)
  }
}
</script>

<template>
  <article class="store-card">
    <div class="store-card__header">
      <h3 class="store-card__name">{{ store.name }}</h3>
      <span v-if="store.district" class="store-card__badge">{{ store.district }}</span>
    </div>

    <dl class="store-card__details">
      <div v-if="store.phone_number" class="store-card__row">
        <dt>Phone</dt>
        <dd>{{ store.phone_number }}</dd>
      </div>
      <div v-if="store.opening_hours" class="store-card__row">
        <dt>Hours</dt>
        <dd>{{ store.opening_hours }}</dd>
      </div>
      <div class="store-card__row">
        <dt>Price</dt>
        <dd>{{ priceLabel }}</dd>
      </div>
    </dl>

    <div class="store-card__actions">
      <a
        v-if="websiteUrl"
        :href="websiteUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="btn btn--outline btn--sm"
      >
        Visit website
      </a>
      <span v-else class="store-card__no-url">No website listed</span>

      <div v-if="user" class="store-card__admin">
        <button type="button" class="btn btn--ghost btn--sm" @click="editStore">Edit</button>
        <button type="button" class="btn btn--danger btn--sm" @click="confirmDelete">
          Delete
        </button>
      </div>
    </div>
  </article>
</template>

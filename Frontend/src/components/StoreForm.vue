<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  initial: { type: Object, default: null },
  submitLabel: { type: String, default: 'Submit' },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['submit'])

const form = reactive({
  name: '',
  url: '',
  district: '',
  phone_number: '',
  opening_hours: '',
  price_range: '',
})

watch(
  () => props.initial,
  (value) => {
    if (value) {
      form.name = value.name || ''
      form.url = value.url || ''
      form.district = value.district || ''
      form.phone_number = value.phone_number || ''
      form.opening_hours = value.opening_hours || ''
      form.price_range = value.price_range || ''
    }
  },
  { immediate: true }
)

function handleSubmit() {
  const body = new URLSearchParams({
    name: form.name,
    url: form.url,
    district: form.district,
    phone_number: form.phone_number,
    opening_hours: form.opening_hours,
    price_range: form.price_range,
  })
  emit('submit', body)
}
</script>

<template>
  <form class="store-form" @submit.prevent="handleSubmit">
    <div class="form-field">
      <label for="name">Store name <span class="required">*</span></label>
      <input id="name" v-model="form.name" type="text" required placeholder="e.g. Åhlens" />
    </div>

    <div class="form-field">
      <label for="url">Website URL</label>
      <input id="url" v-model="form.url" type="text" placeholder="example.se" />
    </div>

    <div class="form-row">
      <div class="form-field">
        <label for="district">District</label>
        <select id="district" v-model="form.district">
          <option value="">Select district</option>
          <option value="Öster">Öster</option>
          <option value="Väster">Väster</option>
        </select>
      </div>

      <div class="form-field">
        <label for="price_range">Price range</label>
        <select id="price_range" v-model="form.price_range">
          <option value="">Select range</option>
          <option value="$">$ — Budget-friendly</option>
          <option value="$$">$$ — Mid-range</option>
          <option value="$$$">$$$ — Premium</option>
        </select>
      </div>
    </div>

    <div class="form-row">
      <div class="form-field">
        <label for="phone_number">Phone number</label>
        <input id="phone_number" v-model="form.phone_number" type="tel" placeholder="036-12 34 56" />
      </div>

      <div class="form-field">
        <label for="opening_hours">Opening hours</label>
        <input
          id="opening_hours"
          v-model="form.opening_hours"
          type="text"
          placeholder="Mon–Fri 10:00–18:00"
        />
      </div>
    </div>

    <button type="submit" class="btn btn--primary btn--full" :disabled="loading">
      {{ loading ? 'Saving...' : submitLabel }}
    </button>
  </form>
</template>

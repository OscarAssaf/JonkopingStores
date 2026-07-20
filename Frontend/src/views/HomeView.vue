<script setup>
import { onMounted } from 'vue'
import HeroSection from '../components/HeroSection.vue'
import StoreFilters from '../components/StoreFilters.vue'
import StoreCard from '../components/StoreCard.vue'
import { useStores } from '../composables/useStores'

const {
  loading,
  error,
  searchQuery,
  districtFilter,
  sortBy,
  districts,
  filteredStores,
  storeCount,
  fetchStores,
  deleteStore,
} = useStores()

onMounted(fetchStores)

async function handleDelete(id) {
  try {
    await deleteStore(id)
  } catch {
    alert('Could not delete store. Make sure you are logged in.')
  }
}
</script>

<template>
  <div>
    <HeroSection :store-count="storeCount" />

    <section id="stores" class="stores-section">
      <div class="container">
        <div class="section-heading">
          <h2>Shop the city centre</h2>
          <p>
            From fashion and home décor to cafés and pharmacies, find everything Jönköping has to offer.
          </p>
        </div>

        <StoreFilters
          v-model:search-query="searchQuery"
          v-model:district-filter="districtFilter"
          v-model:sort-by="sortBy"
          :districts="districts"
          :result-count="filteredStores.length"
        />

        <div v-if="loading" class="state-message">
          <div class="spinner"></div>
          <p>Loading stores...</p>
        </div>

        <div v-else-if="error" class="state-message state-message--error">
          <p>{{ error }}</p>
          <button type="button" class="btn btn--primary" @click="fetchStores">Try again</button>
        </div>

        <div v-else-if="filteredStores.length === 0" class="state-message">
          <p>No stores match your search. Try adjusting your filters.</p>
        </div>

        <div v-else class="store-grid">
          <StoreCard
            v-for="store in filteredStores"
            :key="store.id"
            :store="store"
            @delete="handleDelete"
          />
        </div>
      </div>
    </section>
  </div>
</template>

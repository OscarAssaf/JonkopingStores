<script setup>
defineProps({
  districts: { type: Array, default: () => [] },
  resultCount: { type: Number, default: 0 },
})

const searchQuery = defineModel('searchQuery', { type: String, default: '' })
const districtFilter = defineModel('districtFilter', { type: String, default: 'all' })
const sortBy = defineModel('sortBy', { type: String, default: 'name' })
</script>

<template>
  <section class="filters">
    <div class="filters__search">
      <label for="search" class="visually-hidden">Search stores</label>
      <input
        id="search"
        v-model="searchQuery"
        type="search"
        placeholder="Search by name or district..."
        class="filters__input"
      />
    </div>

    <div class="filters__controls">
      <div class="filters__group">
        <label for="district">District</label>
        <select id="district" v-model="districtFilter" class="filters__select">
          <option value="all">All districts</option>
          <option v-for="district in districts" :key="district" :value="district">
            {{ district }}
          </option>
        </select>
      </div>

      <div class="filters__group">
        <label for="sort">Sort by</label>
        <select id="sort" v-model="sortBy" class="filters__select">
          <option value="name">Name (A–Z)</option>
          <option value="district">District</option>
        </select>
      </div>
    </div>

    <p class="filters__count">
      Showing <strong>{{ resultCount }}</strong> store<span v-if="resultCount !== 1">s</span>
    </p>
  </section>
</template>

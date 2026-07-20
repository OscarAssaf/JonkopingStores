import { ref, computed } from 'vue'

const stores = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const districtFilter = ref('all')
const sortBy = ref('name')

export function useStores() {
  async function fetchStores() {
    loading.value = true
    error.value = null

    try {
      const response = await fetch('/api/stores')
      if (!response.ok) throw new Error('Failed to fetch stores')
      stores.value = await response.json()
    } catch (err) {
      error.value = err.message
      stores.value = []
    } finally {
      loading.value = false
    }
  }

  async function deleteStore(id) {
    const response = await fetch(`/api/stores/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to delete store')
    }

    stores.value = stores.value.filter((store) => store.id !== id)
  }

  const districts = computed(() => {
    const set = new Set()
    stores.value.forEach((store) => {
      if (store.district) set.add(store.district)
    })
    return [...set].sort()
  })

  const filteredStores = computed(() => {
    let result = [...stores.value]

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        (store) =>
          store.name?.toLowerCase().includes(query) ||
          store.district?.toLowerCase().includes(query)
      )
    }

    if (districtFilter.value !== 'all') {
      result = result.filter((store) => store.district === districtFilter.value)
    }

    result.sort((a, b) => {
      if (sortBy.value === 'district') {
        const districtA = a.district || ''
        const districtB = b.district || ''
        if (!districtA && districtB) return 1
        if (districtA && !districtB) return -1
        return districtA.toLowerCase().localeCompare(districtB.toLowerCase())
      }
      const nameA = a.name || ''
      const nameB = b.name || ''
      return nameA.toLowerCase().localeCompare(nameB.toLowerCase())
    })

    return result
  })

  const storeCount = computed(() => stores.value.length)

  return {
    stores,
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
  }
}

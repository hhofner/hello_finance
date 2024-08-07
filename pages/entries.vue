<script setup lang="ts">
const user = useSupabaseUser()
const client = useSupabaseClient()
const toast = useToast()
const route = useRoute()
const maxEntriesPerPage = 10
const currentPage = ref(1)
const totalPages = ref(1)

const columns = [
  {
    key: 'created_at',
    label: 'Date',
  },
  {
    key: 'price',
    label: 'Price',
  },
  {
    key: 'category',
    label: 'Category',
  },
  {
    key: 'account',
    label: 'Account',
  },
  {
    key: 'notes',
    label: 'Notes',
  },
]
const entries = ref([])

async function fetchExpenses(from: number, maxEntries: number) {
  const { data, error, count } = await client
    .from('expenses')
    .select('*', { count: 'exact' })
    .eq('user_id', user.value.id)
    .order('id', { ascending: false })
    .range(from, from + (maxEntries - 1))

  if (error) {
    console.error(error)
    toast.add({
      title: `Error fetching entries: ${JSON.stringify(error)}`,
      color: 'red',
    })
  }
  else {
    totalPages.value = Math.ceil(count / maxEntriesPerPage)
    entries.value = data.map((entry) => {
      return {
        ...entry,
        price: `¥${formatNumber(entry.price)}`,
        created_at: new Date(entry.created_at).toLocaleDateString(),
      }
    })
  }
}

watch(() => currentPage.value, (page) => {
  fetchExpenses((page - 1) * maxEntriesPerPage, maxEntriesPerPage)
})

onMounted(async () => {
  const pageParam = route.query.page || 0
  fetchExpenses(pageParam ? (Number.parseInt(pageParam) * 10) : 0, maxEntriesPerPage)
})
</script>

<template>
  <Header>
    Entries
  </Header>
  <UTable :rows="entries" :columns="columns" class="mb-6" />
  <UPagination v-model="currentPage" :page-count="5" :total="totalPages" />
</template>

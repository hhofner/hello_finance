<script setup lang="ts">
import type { Database } from '@/types/index'

const user = useSupabaseUser()
const client = useSupabaseClient<Database>()
const toast = useToast()
const route = useRoute()
const maxEntriesPerPage = 10
const currentPage = ref(1)
const entryCount = ref(1)

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
interface ExpensesEntry
  extends Omit<Database['public']['Tables']['expenses']['Row'], 'price'> {
  price: string
}

const entries = ref<ExpensesEntry[]>([])

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
    if (count) {
      entryCount.value = count
    }
    entries.value = data.map((entry) => {
      return {
        ...entry,
        price: `¥${formatNumber(entry.price)}`,
        created_at: new Date(entry.created_at).toLocaleDateString(),
      }
    })
  }
}

watch(
  () => currentPage.value,
  (page) => {
    fetchExpenses((page - 1) * maxEntriesPerPage, maxEntriesPerPage)
  },
)

onMounted(async () => {
  const pageParam = route.query.page || 0
  fetchExpenses(
    pageParam ? Number.parseInt(pageParam) * 10 : 0,
    maxEntriesPerPage,
  )
})
</script>

<template>
  <Header> Entries </Header>
  <UTable :rows="entries" :columns="columns" class="mb-6" />
  <UPagination v-model="currentPage" :total="entryCount" />
</template>

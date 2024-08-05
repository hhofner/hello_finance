<script setup lang="ts">
const user = useSupabaseUser()
const client = useSupabaseClient()
const toast = useToast()
const maxEntriesPerPage = ref(10)
const page = ref(1)
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
    key: 'notes',
    label: 'Notes',
  },
]
const entries = ref([])

onMounted(async () => {
  const { data, error, count } = await client
    .from('expenses')
    .select('*', { count: 'exact' })
    .eq('user_id', user.value.id)
    .order('id', { ascending: false })
    .range(0, 10)

  if (error) {
    console.error(error)
    toast.add({
      title: `Error fetching entries: ${JSON.stringify(error)}`,
      color: 'red',
    })
  }
  else {
    entries.value = data.map((entry) => {
      return {
        ...entry,
        price: `¥${entry.price}`,
        created_at: new Date(entry.created_at).toLocaleDateString(),
      }
    })
  }
})
</script>

<template>
  <UTable :rows="entries" :columns="columns" class="mb-6" />
  <UPagination v-model="page" :page-count="5" :total="itemsLength" />
</template>

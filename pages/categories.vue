<script setup lang="ts">
import type { Database } from '@/types/index'

const user = useSupabaseUser()
const client = useSupabaseClient<Database>()
const toast = useToast()

type CategoryEntry = Database['public']['Tables']['categories']['Row'] & {
  sum?: number
}

const categories = ref<CategoryEntry[]>([])

async function fetchSumsByCategory() {
  const { data, error } = await client
    .from('expenses')
    .select('category, price.sum()')
    .eq('user_id', user.value.id)

  if (error) {
    console.error(error)
    toast.add({
      title: `Error fetching categories: ${JSON.stringify(error)}`,
      color: 'red',
    })
  }
  else {
    return data
  }
}
async function fetchCategories() {
  const { data, error } = await client
    .from('categories')
    .select('*')
    .eq('user_id', user.value.id)

  if (error) {
    console.error(error)
    toast.add({
      title: `Error fetching categories: ${JSON.stringify(error)}`,
      color: 'red',
    })
  }
  else {
    return data
  }
}

const columns = [
  {
    key: 'title',
    label: 'Title',
  },
  {
    key: 'sum',
    label: 'Total',
  },
]

onMounted(() => {
  const allCategories = fetchCategories()
  const expensesByCategories = fetchSumsByCategory()

  Promise.all([allCategories, expensesByCategories]).then(([cats, expenses]) => {
    if (!cats || !expenses)
      return
    const categoriesWithSums = cats.map((category: CategoryEntry) => {
      const sum = expenses.find((expense: any) => expense.category === category.title)?.sum || 0
      return { ...category, sum }
    })
    categories.value = categoriesWithSums.sort((a, b) => b.sum - a.sum)
  })
})
</script>

<template>
  <Header>Categories</Header>
  <UTable :rows="categories" :columns="columns" class="mb-6">
    <template #sum-data="{ row }">
      <span class="text-right">¥ {{ formatNumber(row.sum) }}</span>
    </template>
  </UTable>
</template>

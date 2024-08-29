<script setup lang="ts">
import type { Database } from '@/types/index'

const user = useSupabaseUser()
const client = useSupabaseClient<Database>()
const toast = useToast()

interface SubCategory {
  key: string
  title: string
  sum?: number
  subCategory?: SubCategory[]
}
type CategoryEntry = Database['public']['Tables']['categories']['Row'] & {
  sum?: number
  subCategory?: SubCategory[]
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
      if (category.title.includes('::')) {
        const [parent, child] = category.title.split('::')
        const parentCategory = categoriesWithSums.find(cat => cat.title === parent)
        if (parentCategory) {
          if (!parentCategory.subCategory) {
            parentCategory.subCategory = []
          }
          parentCategory.subCategory.push({ key: child, title: child, sum })
          return parentCategory
        }
      }
      return { ...category, sum }
    })
    categories.value = categoriesWithSums.sort((a, b) => b.sum - a.sum)
    // then we need to join the ones that have :: into one category
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

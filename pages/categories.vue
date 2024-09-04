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
  {
    key: 'actions',
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
      // if (category.title.includes('::')) {
      //   const [parent, child] = category.title.split('::')
      //   const parentCategory = categoriesWithSums.find(cat => cat.title === parent)
      //   if (parentCategory) {
      //     if (!parentCategory.subCategory) {
      //       parentCategory.subCategory = []
      //     }
      //     parentCategory.subCategory.push({ key: child, title: child, sum })
      //     return parentCategory
      //   }
      // }
      return { ...category, sum }
    })
    // Sort into subcategories

    categories.value = categoriesWithSums.sort((a, b) => b.sum - a.sum)
    // then we need to join the ones that have :: into one category
  })
})
const selectedCategory = ref<{ id: string, title: string } | null>(null)

const deleteCategoryText = ref<string | null>(null)
const modalStatus = ref<'delete' | 'edit'>('edit')
const isOpen = ref(false)

function items(row) {
  return [
    [{
      label: 'Edit',
      icon: 'i-heroicons-pencil-square-20-solid',
      click: () => {
        selectedCategory.value = { id: row.id, title: row.title }
        modalStatus.value = 'edit'
        isOpen.value = true
      },
    // }, {
    //   label: 'Duplicate',
    //   icon: 'i-heroicons-document-duplicate-20-solid',
    },
    ],
    // [{
    //   label: 'Archive',
    //   icon: 'i-heroicons-archive-box-20-solid',
    // }],
    // [{
    //   label: 'Delete',
    //   icon: 'i-heroicons-trash-20-solid',
    //   click: () => {
    //     deleteCategoryText.value = row.title
    //     modalStatus.value = 'delete'
    //     isOpen.value = true
    //   },
    // }],
  ]
}

async function editCategory(categoryId: string, newTitle: string) {
  const { error } = await client.from('categories').update({ title: newTitle }).eq('id', categoryId)

  if (error) {
    console.error(error)
    toast.add({
      title: `Error editing category: ${JSON.stringify(error)}`,
      color: 'red',
    })
  }
  else {
    toast.add({ title: `Edited category to "${newTitle}"`, color: 'blue' })
  }

  isOpen.value = false
}
</script>

<template>
  <Header>Categories</Header>
  <UTable :rows="categories" :columns="columns" class="mb-6">
    <template #sum-data="{ row }">
      <span class="text-right">¥ {{ formatNumber(row.sum) }}</span>
    </template>
    <template #actions-data="{ row }">
      <UDropdown :items="items(row)">
        <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
      </UDropdown>
    </template>
  </UTable>
  <UModal v-model="isOpen">
    <UCard>
      <template #header>
        <h2 class="font-lg font-semibold">
          {{ modalStatus === 'edit' ? 'Edit' : 'Delete' }} Category
        </h2>
      </template>
      <Placeholder class="h-32" />
      <p v-if="modalStatus === 'delete'">
        Delete category "{{ selectedCategory?.title }}"?
      </p>
      <div v-else>
        <UFormGroup name="title">
          <template #label>
            <div class="flex items-center gap-1">
              Title
            </div>
          </template>
          <UInput v-model="selectedCategory!.title" type="text" />
        </UFormGroup>
      </div>
      <template #footer>
        <UButton color="gray" class="mr-4" @click="deleteCategoryText = null">
          Cancel
        </UButton>
        <UButton v-if="modalStatus === 'delete'" type="submit" color="red" @click="deleteCategoryText = null">
          Delete
        </UButton>
        <UButton v-else type="submit" color="green" @click="() => editCategory(selectedCategory?.id, selectedCategory.title)">
          Save
        </ubutton>
      </template>
    </UCard>
  </UModal>
</template>

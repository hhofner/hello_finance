<script setup lang="ts">
import * as v from 'valibot'
import { format } from 'date-fns'
import type { FormSubmitEvent } from '#ui/types'
import type { Database } from '@/types/index'

const toast = useToast()
const spent = useSpent()
const isLoading = ref(false)

const schema = v.object({
  price: v.pipe(v.number(), v.integer()),
  category: v.string(),
  notes: v.string(),
  account: v.string(),
  date: v.date(),
})

type Schema = v.InferOutput<typeof schema>

const state = ref({
  price: undefined,
  category: undefined,
  notes: '',
  account: undefined,
  date: new Date(),
})

const newCategory = ref('')

const categories = ref<Array<string>>([])
const accounts = ref<Array<string>>([])

const client = useSupabaseClient<Database>()
const user = useSupabaseUser()

onMounted(async () => {
  const { data, error } = await client
    .from('categories')
    .select('*')
    .eq('user_id', user.value.id)

  if (error) {
    console.error('Error fetching categories', error)
  }
  else if (data) {
    categories.value = data.map((category: any) => category.title)
  }
  else {
    categories.value = []
  }

  const { data: accountsData, error: accountsError } = await client
    .from('accounts')
    .select('*')
    .eq('user_id', user.value.id)

  if (accountsError) {
    console.error('Error fetching accounts', accountsError)
  }
  else if (accountsData) {
    accounts.value = accountsData.map((account: any) => account.name)
  }
  else {
    accounts.value = []
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true
  const { error } = await client.from('expenses').insert({
    price: event.data.price,
    category: event.data.category,
    notes: event.data.notes,
    account: event.data.account,
    user_id: user.value.id,
    created_at: event.data.date,
  })

  if (error) {
    console.error('Error inserting data', error)
    toast.add({ title: `Error adding expense: ${error}`, color: 'red' })
  }
  else {
    toast.add({ title: 'Expense added', color: 'green' })

    state.value = {
      price: undefined,
      category: undefined,
      notes: '',
      account: undefined,
      date: new Date(),
    }
  }
  spent.addSpent(event.data.price)
  isLoading.value = false
}

async function addCategory() {
  isLoading.value = true
  const { error } = await client.from('categories').insert({
    title: newCategory.value,
    user_id: user.value.id,
  })

  if (error) {
    console.error('Error adding category', error)
    toast.add({
      title: `Error adding category \"${error}\"`,
      color: 'red',
    })
  }
  else {
    const temp = newCategory.value
    categories.value.push(newCategory.value)
    newCategory.value = ''
    toast.add({ title: `Added new category \"${temp}\"`, color: 'blue' })
  }
  isLoading.value = false
}
</script>

<template>
  <UForm :schema="v.safeParser(schema)" :state="state" class="space-y-4" :validate-on="['submit']" @submit="onSubmit">
    <UFormGroup name="price" size="xl">
      <template #label>
        <div class="flex items-center gap-1">
          <UIcon name="i-iconoir-yen-square-solid" />
          Price
        </div>
      </template>

      <UInput v-model="state.price" :autofocus="true" type="number" />
    </UFormGroup>

    <UFormGroup name="category" size="xl">
      <template #label>
        <div class="flex items-center gap-1">
          <UIcon name="i-tabler-category-filled" />
          Category
        </div>
      </template>
      <USelect v-model="state.category" :options="categories" />
    </UFormGroup>
    <div class="flex gap-4">
      <UInput v-model="newCategory" color="gray" variant="outline" size="xl" placeholder="New Category" />
      <UButton
        :disabled="isLoading" color="blue" variant="soft" icon="i-material-symbols-add-circle-outline"
        @click="addCategory"
      >
        Add Category
      </UButton>
    </div>
    <UFormGroup name="accounts" size="xl">
      <template #label>
        <div class="flex items-center gap-1">
          <UIcon name="i-tabler-credit-card" />
          Account
        </div>
      </template>
      <USelect v-model="state.account" :options="accounts" />
    </UFormGroup>
    <UPopover :popper="{ placement: 'bottom-start' }">
      <UButton icon="i-heroicons-calendar-days-20-solid" :label="format(state.date, 'd MMM, yyy')" variant="soft" />
      <template #panel="{ close }">
        <DatePicker v-model="state.date" @close="close" />
      </template>
    </UPopover>
    <UTextarea v-model="state.notes" size="xl" placeholder="Notes..." />

    <div class="flex items-center gap-2">
      <UButton type="submit" :loading="isLoading">
        Submit
      </UButton>
    </div>
  </UForm>
</template>

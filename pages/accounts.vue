<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '#ui/types'
import type { Database } from '@/types/index'

const user = useSupabaseUser()
const client = useSupabaseClient<Database>()
const toast = useToast()
const spend = ref({})
const accounts = ref([])

async function fetchSpend() {
  const currentDate = new Date()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  // Get the first day of the next month (to get all values for the current month)
  const firstDayOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
  const { data, error } = await client
    .from('expenses')
    .select('*')
    .gte('created_at', firstDayOfMonth.toISOString())
    .lt('created_at', firstDayOfNextMonth.toISOString())
    .neq('account', null)
    .eq('user_id', user.value.id)

  if (error) {
    toast.add({
      title: `Error fetching spend: ${JSON.stringify(error)}`,
      color: 'red',
    })
  }
  else {
    data.forEach((expense) => {
      if (!spend.value[expense.account]) {
        spend.value[expense.account] = expense.price
      }
      else {
        spend.value[expense.account] += expense.price
      }
    })
  }

  // const { data, error } = await client
  //   .from('expenses')
  //   .select('*')
  //   .eq('user_id', user.value.id)
  //   .gte('created_at', Date())
}

async function fetchAccounts() {
  const { data, error } = await client
    .from('accounts')
    .select('*')
    .eq('user_id', user.value.id)

  if (error) {
    toast.add({
      title: `Error fetching accounts: ${JSON.stringify(error)}`,
      color: 'red',
    })
  }
  else {
    accounts.value = data
  }
}
onMounted(() => {
  fetchSpend()
  fetchAccounts()
})

const schema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
})
type Schema = v.InferOutput<typeof schema>

const state = ref({
  name: null,
})

const isLoading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true
  const { data, error } = await client
    .from('accounts')
    .insert({
      name: event.data.name,
      user_id: user.value.id,
    })
    .select()

  if (error) {
    toast.add({ title: `Error adding account: ${JSON.stringify(error)}`, color: 'red' })
  }
  else {
    toast.add({ title: 'Added new account', color: 'green' })
    accounts.value.push(data[0])
    state.value = { name: null }
  }
  isLoading.value = false
}
</script>

<template>
  <Header>
    Accounts This Month
  </Header>
  <div class="grid grid-cols-2 gap-4 my-4">
    <UCard v-for="account in accounts" :key="account.id">
      <template #header>
        <h2 class="font-semibold">
          {{ account.name }}
        </h2>
      </template>
      <p>¥{{ formatNumber(spend[account.name] || 0) }}</p>
    </UCard>
  </div>
  <UDivider label="Create new account" />
  <UForm
    :schema="v.safeParser(schema)"
    :state="state"
    class="space-y-4"
    :validate-on="['submit']"
    @submit="onSubmit"
  >
    <UFormGroup name="name" size="xl">
      <template #label>
        <div class="flex items-center gap-1">
          Account Name
        </div>
      </template>

      <UInput v-model="state.name" placeholder="Big Bank Name" />
    </UFormGroup>
    <UButton type="submit" :loading="isLoading">
      Submit
    </UButton>
  </UForm>
</template>

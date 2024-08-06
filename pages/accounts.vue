<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '#ui/types'

const user = useSupabaseUser()
const client = useSupabaseClient()
const toast = useToast()
const accounts = ref([])

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
    isLoading.value = false
  }
}
</script>

<template>
  <Header>
    Accounts
  </Header>
  <div class="grid grid-cols-2 gap-4 my-4">
    <UCard v-for="account in accounts" :key="account.id">
      <template #header>
        <h2>
          {{ account.name }}
        </h2>
      </template>
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

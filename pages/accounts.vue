<script setup lang="ts">
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
</script>

<template>
  <Header>
    Accounts
  </Header>
  <div class="grid grid-cols-2 gap-4 mt-4">
    <UCard v-for="account in accounts" :key="account.id">
      <template #header>
        <h2>
          {{ account.name }}
        </h2>
      </template>
    </UCard>
    <UButton class="flex items-center gap-2" variant="outline">
      New account
      <UIcon name="i-material-symbols-add-box-outline" class="w-5 h-5" />
    </UButton>
  </div>
</template>

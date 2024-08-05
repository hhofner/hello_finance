<script setup lang="ts">
const user = useSupabaseUser()
const client = useSupabaseClient()

const spentThisMonth = ref(0)

onMounted(async () => {
  // TODO: Fetch expenses only for the current month
  if (!user.value)
    return
  const { data, error } = await client
    .from('expenses')
    .select('price')
    .eq('user_id', user.value.id)

  if (error) {
    console.log('Error fetching expenses', error)
  }
  else if (data) {
    spentThisMonth.value = data.reduce(
      (acc: number, expense: any) => acc + expense.price,
      0,
    )
  }
  else {
    spentThisMonth.value = 0
  }
})
const route = useRoute()

const links = [
  {
    label: 'Quick Input',
    icon: 'i-material-symbols-input',
    to: '/',
  },
  {
    label: 'Entries',
    icon: 'i-material-symbols-format-list-bulleted-rounded',
    to: '/entries',
  },
  {
    label: 'Stats',
    icon: 'i-material-symbols-query-stats',
    to: '/stats',
  },
  {
    label: 'Accounts',
    icon: 'i-material-symbols-account-balance-wallet',
    to: '/accounts',
  },
  {
    label: 'Subscriptions',
    icon: 'i-material-symbols-settings',
    to: '/subscriptions',
  },
]
</script>

<template>
  <UContainer>
    <UCard class="mt-10">
      <template #header>
        <div class="flex justify-between">
          <h1 class="text-3xl text-primary-500">
            Hello Finance
          </h1>
          <ColorScheme>
            <USelect
              v-model="$colorMode.preference"
              :options="['system', 'light', 'dark']"
            />
          </ColorScheme>
        </div>
        <div>
          <p class="text-gray-500 flex items-center gap-1">
            This Month: <span>¥{{ spentThisMonth }}</span>
            <UIcon
              name="i-material-symbols-trending-up"
              class="w-5 h-5"
            />
          </p>
        </div>
      </template>
      <UHorizontalNavigation
        :links="links"
        class="border-b border-gray-200 dark:border-gray-800 mb-4"
      />
      <NuxtPage />
    </UCard>
  </UContainer>
  <UNotifications :timeout="80000" />
</template>

<script setup lang="ts">
import type { Database } from '@/types/index'

useHead({
  titleTemplate: 'Hello Budget',
})

const user = useSupabaseUser()
const client = useSupabaseClient<Database>()

const spentThisMonth = ref(0)
const budget = ref(200000)
const meterColor = computed(() => {
  const percentage = (spentThisMonth.value / budget.value) * 100
  if (percentage <= 75) {
    return 'primary'
  }
  else if (percentage <= 89) {
    return 'amber'
  }
  else {
    return 'red'
  }
})

onMounted(async () => {
  // TODO: Fetch expenses only for the current month
  if (!user.value)
    return

  const currentDate = new Date()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const firstDayOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)

  const { data, error } = await client
    .from('expenses')
    .select('price')
    .eq('user_id', user.value.id)
    .gte('created_at', firstDayOfMonth.toISOString())
    .lt('created_at', firstDayOfNextMonth.toISOString())

  if (error) {
    console.error('Error fetching expenses', error)
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

const isOpen = ref(false)
function closeSlideover() {
  isOpen.value = false
}
const links = [
  {
    label: 'Quick Entry',
    icon: 'i-material-symbols-input',
    to: '/',
    click: closeSlideover,
  },
  {
    label: 'Entries',
    icon: 'i-material-symbols-format-list-bulleted-rounded',
    to: '/entries',
    click: closeSlideover,
  },
  {
    label: 'Stats',
    icon: 'i-material-symbols-query-stats',
    to: '/stats',
    click: closeSlideover,
  },
  {
    label: 'Accounts',
    icon: 'i-material-symbols-account-balance-wallet',
    to: '/accounts',
    click: closeSlideover,
  },
  {
    label: 'Subscriptions',
    icon: 'i-material-symbols-settings',
    to: '/subscriptions',
    click: closeSlideover,
  },
]
</script>

<template>
  <UContainer class="pb-4">
    <UCard class="mt-10">
      <template #header>
        <div class="flex justify-between">
          <h1 class="text-3xl text-primary-500">
            Hello Budget
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
            Budget: <span>¥{{ formatNumber(budget) }}</span>
          </p>
        </div>
        <UMeter size="md" icon="i-solar-money-bag-bold-duotone" indicator :label="`Spent this month: ${formatNumber(spentThisMonth)}`" :value="(spentThisMonth / budget) * 100" :color="meterColor" />
      </template>
      <NuxtPage />
    </UCard>
  </UContainer>
  <USlideover v-model="isOpen">
    <div class="p-4 flex-1">
      <UButton
        color="gray"
        variant="ghost"
        size="sm"
        icon="i-heroicons-x-mark-20-solid"
        class="flex sm:hidden absolute end-5 top-5 z-10"
        square
        padded
        @click="isOpen = false"
      />

      <!-- <Placeholder class="h-full" /> -->
      <UVerticalNavigation :links="links" class="mt-10" />
    </div>
  </USlideover>
  <UNotifications :timeout="80000" />
  <UButton size="xl" square class="fixed bottom-8 right-8" icon="i-fluent-navigation-unread-20-filled" @click="isOpen = true" />
</template>

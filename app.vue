<script setup lang="ts">
useHead({
  titleTemplate: 'Hello Budget',
})

const spent = useSpent()
await spent.fetch()

const user = useSupabaseUser()
const budget = ref(200000)
const meterColor = computed(() => {
  const percentage = (spent.spent / budget.value) * 100
  if (percentage <= 80) {
    return 'primary'
  }
  else if (percentage <= 95) {
    return 'orange'
  }
  else {
    return 'red'
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
    label: 'Categories',
    icon: 'i-material-symbols-category',
    to: '/categories',
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
  {
    label: 'Stats',
    icon: 'i-material-symbols-query-stats',
    to: '/stats',
    click: closeSlideover,
  },
]
</script>

<template>
  <NuxtPwaManifest />
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
          <p v-if="user" class="text-gray-500 flex items-center gap-1">
            Budget: <span>¥{{ formatNumber(budget) }}</span>
          </p>
          <p v-else>
            Log in to start tracking your expenses!
          </p>
        </div>
        <UMeter size="md" icon="i-solar-money-bag-bold-duotone" indicator :label="`Spent this month: ${formatNumber(spent.spent)}`" :value="(spent.spent / budget) * 100" :color="meterColor" />
      </template>
      <NuxtPage />
    </UCard>
  </UContainer>
  <USlideover v-model="isOpen">
    <div class="p-4 flex-1 flex flex-col">
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
      <div class="flex-grow" />

      <UVerticalNavigation :links="links" class="mt-10" />
    </div>
  </USlideover>
  <UNotifications :timeout="80000" />
  <UButton size="xl" square class="fixed bottom-8 right-8" icon="i-fluent-navigation-unread-20-filled" @click="isOpen = true" />
</template>

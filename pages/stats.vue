<script setup lang="ts">
import { fetchEntriesThisMonth } from '~/utils/entries'

const entries = ref<{ price: number, created_at: string }[]>([])
const lastMonthEntries = ref<{ price: number, created_at: string }[]>([])
const totalExpensesByDay = computed(() => {
  return entries.value.reduce((acc, entry) => {
    const day = new Date(entry.created_at).getUTCDate()
    if (!acc[day]) {
      acc[day] = 0
    }
    if (entry.price !== 100500) {
      acc[day] += entry.price
    }
    return acc
  }, {} as Record<string, number>)
})
const totalExpensesByDayLastMonth = computed(() => {
  return lastMonthEntries.value.reduce((acc, entry) => {
    const day = new Date(entry.created_at).getUTCDate()
    if (!acc[day]) {
      acc[day] = 0
    }
    if (entry.price !== 100500) {
      acc[day] += entry.price
    }
    return acc
  }, {} as Record<string, number>)
})
const dayTrendOption = computed(() => ({
  title: {
    text: 'Daily Trend',
  },
  xAxis: {
    type: 'category',
    data: Object.keys(totalExpensesByDay.value),
  },
  yAxis: {
    axisLabel: {
      formatter(value, index) {
        return formatNumber(value)
      },
      alignWithLabel: true,
    },
    type: 'value',
  },
  series: [
    {
      type: 'line',
      data: Object.values(totalExpensesByDay.value),
    },
    {
      type: 'line',
      data: Object.values(totalExpensesByDayLastMonth.value),
    },
  ],
}))

onMounted(async () => {
  const { error, data } = await fetchEntriesThisMonth()
  if (error) {
    console.error(error)
  }
  else {
    entries.value = data
  }
  // get width of inner container
})
const { error: lastMonthError, data: lastMonthData } = await fetchEntriesLastMonth()
if (lastMonthError) {
  console.error(lastMonthError)
}
else {
  lastMonthEntries.value = lastMonthData
}
</script>

<template>
  <!-- <VChart :option="option" :init-options="{ width, height }" /> -->
  <div class="w-full h-full">
    <VChart v-if="entries.length > 0" :option="dayTrendOption" class="w-full h-72" :autoresize="true" />
  </div>
  <div />
</template>

<script setup lang="ts">
import { fetchEntriesThisMonth } from '~/utils/entries'

const colors = ref([
  '#fde68a',
  '#d9f99d',
  '#a5f3fc',
  '#bfdbfe',
  '#ddd6fe',
  '#fbcfe8',
])
const entries = ref<{ price: number, created_at: string }[]>([])
const totalExpensesByDay = computed(() => {
  return entries.value.reduce((acc, entry) => {
    const day = new Date(entry.created_at).getUTCDate()
    if (!acc[day]) {
      acc[day] = 0
    }
    acc[day] += entry.price
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
</script>

<template>
  <!-- <VChart :option="option" :init-options="{ width, height }" /> -->
  <div class="w-full h-full">
    <VChart v-if="entries.length > 0" :option="dayTrendOption" class="w-full h-72" :autoresize="true" />
  </div>
  <div />
</template>

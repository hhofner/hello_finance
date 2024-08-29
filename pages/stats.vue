<script setup lang="ts">
const colors = ref([
  '#fde68a',
  '#d9f99d',
  '#a5f3fc',
  '#bfdbfe',
  '#ddd6fe',
  '#fbcfe8',
])
const option = ref<ECOption>({
  title: {
    text: 'Monthly Costs by Category',
  },
  legend: {
    // Try 'horizontal'
    orient: 'vertical',
    right: 10,
    top: 'center',
  },
  yAxis: {
    type: 'value',
    show: false,
  },
  xAxis: {
    type: 'category',
    data: ['Transportation', 'Food', 'Household', 'Groceries', 'Test'],
    axisLabel: {
      rotate: 45,
    },
  },
  series: [
    {
      type: 'bar',
      data: [
        { value: 460, itemStyle: { color: colors.value[1] } },
        { value: 12305, itemStyle: { color: colors.value[2] } },
        { value: 82305, itemStyle: { color: colors.value[3] } },
        { value: 305, itemStyle: { color: colors.value[4] } },
        { value: 1305, itemStyle: { color: colors.value[5] } },
      ],
      label: {
        show: true,
        position: 'top',
      },
    },
  ],
})
const width = ref<number>(350)
const height = ref<number>(350)
onMounted(() => {
  // get width of inner container
})
</script>

<template>
  <VChart :option="option" :init-options="{ width, height }" />
</template>

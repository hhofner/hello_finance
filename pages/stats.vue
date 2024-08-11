<script setup lang="ts">
import { VisDonut, VisSingleContainer, VisTooltip } from '@unovis/vue'
import { Donut } from '@unovis/ts'

const props = defineProps<{ data: number[] }>()
const triggers = { [Donut.selectors.segment]: d => d.data }
const value = (d: number) => d
</script>

<template>
  <VisSingleContainer :data="data">
    <VisTooltip :triggers="triggers" />
    <VisDonut :value="value" />
  </VisSingleContainer>
</template>

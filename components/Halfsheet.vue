<script setup lang="ts">
defineProps<{ isOpen: boolean }>()
const emit = defineEmits(['close'])
</script>

<template>
  <Transition name="halfsheet">
    <div
      v-if="isOpen"
      class="fixed inset-x-0 bottom-0 z-50 w-full transform border border-gray-200 dark:border-gray-200/80"
    >
      <div class="w-full max-h-[90vh] overflow-y-auto bg-white dark:bg-black ">
        <div class="p-5">
          <slot name="header" />
          <UButton
            color="gray"
            variant="ghost"
            size="sm"
            icon="i-heroicons-x-mark-20-solid"
            class="flex sm:hidden absolute end-5 top-5 z-10"
            square
            padded
            @click="emit('close')"
          />
        </div>
        <div class="p-5">
          <slot name="content" />
        </div>
        <div class="p-5">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.halfsheet-enter-active,
.halfsheet-leave-active {
  transition: transform 0.3s ease;
}

.halfsheet-enter-from,
.halfsheet-leave-to {
  transform: translateY(100%);
}

.halfsheet-enter-to,
.halfsheet-leave-from {
  transform: translateY(0);
}
</style>

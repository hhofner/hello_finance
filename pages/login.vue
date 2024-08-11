<script setup lang="ts">
import type { Database } from '@/types/index'

const supabase = useSupabaseClient<Database>()
const email = ref('')
const config = useRuntimeConfig()
const hasSent = ref(false)

async function signInWithOtp() {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: `${config.public.APP_URL}/confirm`,
    },
  })
  if (error) {
    console.error(error)
  }
  else {
    hasSent.value = true
  }
}
</script>

<template>
  <div class="space-y-2">
    <UInput v-model="email" type="email" placeholder="Email" />
    <UButton :disabled="hasSent" @click="signInWithOtp">
      Sign In or Register with E-Mail
    </UButton>
    <span v-if="hasSent" class="inline-flex items-center gap-2 ml-4"><UIcon name="i-material-symbols-check" />Sent! Check your email.</span>
  </div>
</template>

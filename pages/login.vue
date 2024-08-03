<script setup lang="ts">
const supabase = useSupabaseClient()
const email = ref('')
const config = useRuntimeConfig()

const signInWithOtp = async () => {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.value,
    options: {
      emailRedirectTo: config.public.APP_URL,
    }
  })
  if (error) console.log(error)
}
</script>
<template>
  <div class="space-y-2">
    <UInput v-model="email" type="email" placeholder="Email" />
    <UButton @click="signInWithOtp">
      Sign In with E-Mail
    </UButton>
  </div>
</template>

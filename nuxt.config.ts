// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/supabase'],

  runtimeConfig: {
    public: {
      APP_URL: process.env.APP_URL,
    },
  },

  compatibilityDate: '2024-08-05',
})

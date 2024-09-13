// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/supabase', '@pinia/nuxt', 'nuxt-echarts', '@vite-pwa/nuxt'],

  runtimeConfig: {
    public: {
      APP_URL: process.env.APP_URL,
    },
  },
  compatibilityDate: '2024-08-05',
  echarts: {
    charts: ['BarChart', 'LineChart'],
    components: ['DatasetComponent', 'GridComponent', 'TooltipComponent', 'TitleComponent', 'LegendComponent'],
    ssr: false,
  },
  pwa: {
    registerType: 'prompt',
    devOptions: {
      enabled: false,
    },
  },
})

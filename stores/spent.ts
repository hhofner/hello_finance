import type { Database } from '@/types/index'

export const useSpent = defineStore('spent', {
  state: () => ({
    spent: 0,
  }),
  actions: {
    addSpent(amount: number) {
      this.spent += amount
    },
    async fetch() {
      const user = useSupabaseUser()
      if (!user.value) {
        return
      }
      const client = useSupabaseClient<Database>()
      const currentDate = new Date()
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

      const firstDayOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)

      const { data, error } = await client
        .from('expenses')
        .select('price')
        .eq('user_id', user.value?.id)
        .gte('created_at', firstDayOfMonth.toISOString())
        .lt('created_at', firstDayOfNextMonth.toISOString())

      if (error) {
        console.error('Error fetching expenses', error)
      }
      else if (data) {
        this.spent = data.reduce(
          (acc: number, expense: any) => acc + expense.price,
          0,
        )
      }
    },
  },
})

export async function fetchEntriesThisMonth() {
  const user = useSupabaseUser()
  if (!user.value) {
    return
  }
  const client = useSupabaseClient()
  const currentDate = new Date()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const firstDayOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
  const { data, error } = await client
    .from('expenses')
    .select('price, created_at')
    .eq('user_id', user.value.id)
    .gte('created_at', firstDayOfMonth.toISOString())
    .lt('created_at', firstDayOfNextMonth.toISOString())

  return { data, error }
}

export async function fetchEntriesLastMonth() {
  const user = useSupabaseUser()
  if (!user.value) {
    return
  }
  const client = useSupabaseClient()
  const currentDate = new Date()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
  const firstDayOfNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const { data, error } = await client
    .from('expenses')
    .select('price, created_at')
    .eq('user_id', user.value.id)
    .gte('created_at', firstDayOfMonth.toISOString())
    .lt('created_at', firstDayOfNextMonth.toISOString())

  return { data, error }
}

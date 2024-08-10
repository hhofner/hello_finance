<script setup lang="ts">
import * as v from 'valibot'
import { format } from 'date-fns'
import type { FormSubmitEvent } from '#ui/types'
import type { Database } from '@/types/index'

const columns = [
  {
    key: 'name',
    label: 'Name',
  },
  {
    key: 'start_date',
    label: 'Start Date',
  },
  {
    key: 'cost',
    label: 'Cost',
  },
  {
    key: 'frequency',
    label: 'Frequency',
  },
  {
    key: 'paid',
    label: 'Paid This Month',
  },
]

const schema = v.object({
  name: v.pipe(v.string(), v.minLength(1)),
  frequency: v.pipe(v.string()),
  startDate: v.date(),
  cost: v.number(),
})

type Schema = v.InferOutput<typeof schema>

const frequencyOptions = ['Monthly', 'Yearly']
const state = ref({
  name: null,
  frequency: null,
  startDate: new Date(),
  cost: null,
})

watch(() => state.value.startDate, (value) => {
  console.log('value', value)
})

const isLoading = ref(false)
const user = useSupabaseUser()
const client = useSupabaseClient<Database>()
const toast = useToast()
interface SubscriptionEntry extends Omit<Database['public']['Tables']['subscriptions']['Row'], 'start_date'> {
  start_date: string
}
const subscriptions = ref<SubscriptionEntry[]>([])
onMounted(async () => {
  const { data, error } = await client.from('subscriptions')
    .select('*')
    .eq('user_id', user.value.id)
    .order('start_date', { ascending: false })

  if (error) {
    console.error('Error fetching data', error)
    toast.add({ title: `Error fetching subscriptions: ${error}`, color: 'red' })
  }
  else {
    subscriptions.value = data.map((entry) => {
      return {
        ...entry,
        start_date: new Date(entry.start_date).toLocaleDateString(),
      }
    })
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true

  const { error } = await client.from('subscriptions')
    .insert({
      name: event.data.name,
      frequency: event.data.frequency,
      start_date: event.data.startDate.toISOString(),
      cost: event.data.cost,
      user_id: user.value.id,
      paid: false,
    })

  if (error) {
    console.error('Error inserting data', error)
    toast.add({ title: `Error adding subscription: ${error}`, color: 'red' })
  }
  else {
    toast.add({ title: `${state.value.name} subscription added!`, color: 'green' })

    state.value = {
      name: null,
      frequency: null,
      startDate: new Date(),
      cost: null,
    }
  }

  isLoading.value = false
}
</script>

<template>
  <Header>Subscriptions</Header>
  <UTable :rows="subscriptions" :columns="columns" class="mb-6">
    <template #paid-data="{ row }">
      <UBadge :color="row.paid ? 'green' : 'red'" variant="subtle">
        {{ row.paid ? 'Paid' : 'Not Paid' }}
      </UBadge>
    </template>
  </UTable>
  <UBadge color="blue" variant="outline" size="lg">
    Total: <span class="text-secondary-500 font-semibold">¥{{ subscriptions.reduce((acc, row) => acc + row.cost, 0) }}</span>
  </UBadge>
  <UDivider label="Create new subscription" />
  <UForm
    :schema="v.safeParser(schema)"
    :state="state"
    class="space-y-4"
    :validate-on="['submit']"
    @submit="onSubmit"
  >
    <UFormGroup name="name" size="xl">
      <template #label>
        <div class="flex items-center gap-1">
          Subscription Name
        </div>
      </template>

      <UInput v-model="state.name" placeholder="AppleTV" />
    </UFormGroup>
    <UFormGroup name="name" size="xl">
      <template #label>
        <div class="flex items-center gap-1">
          Cost
        </div>
      </template>

      <UInput v-model="state.cost" placeholder="¥500" type="number" />
    </UFormGroup>
    <UFormGroup name="name" size="xl">
      <template #label>
        <div class="flex items-center gap-1">
          Frequency
        </div>
      </template>

      <USelect v-model="state.frequency" :options="frequencyOptions" />
    </UFormGroup>
    <UFormGroup>
      <template #label>
        <div class="flex items-center gap-1">
          Start Date
        </div>
      </template>
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton
          icon="i-heroicons-calendar-days-20-solid"
          :label="format(state.startDate, 'd MMM, yyy')"
          variant="soft"
        />
        <template #panel="{ close }">
          <DatePicker v-model="state.startDate" @close="close" />
        </template>
      </UPopover>
    </UFormGroup>
    <UButton type="submit" :loading="isLoading">
      Submit
    </UButton>
  </UForm>
</template>

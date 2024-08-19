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
const isOpen = ref(false)

type Schema = v.InferOutput<typeof schema>

const frequencyOptions = ['Monthly', 'Yearly']
const state = ref({
  name: null,
  frequency: null,
  startDate: new Date(),
  cost: null,
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

const selectedSubscription = ref<any>([])

const selectedSubscriptionToAdd = ref<SubscriptionEntry | null>(null)
function setSelectedSubscription(id: number) {
  selectedSubscriptionToAdd.value = subscriptions.value.find(entry => entry.id === id) ?? null
  isOpen.value = true
}

async function createEntry() {
  if (!selectedSubscriptionToAdd.value) {
    return
  }
  const { error } = await client.from('expenses').insert({
    price: selectedSubscriptionToAdd.value.cost,
    category: 'Subscription',
    notes: selectedSubscriptionToAdd.value.name,
    account: 'Rakuten Card',
    user_id: user.value.id,
    created_at: new Date().toISOString(),
  })

  const { error: updateError } = await client.from('subscriptions')
    .update({ paid: true })
    .eq('id', selectedSubscriptionToAdd.value.id)
    .eq('user_id', user.value.id)

  if (error || updateError) {
    console.error('Error inserting data')
    toast.add({ title: `Error adding expense: ${error}`, color: 'red' })
  }
  else {
    toast.add({ title: 'Expense added', color: 'green' })
    subscriptions.value = subscriptions.value.map((subscription) => {
      if (subscription.id === selectedSubscriptionToAdd.value!.id) {
        return {
          ...subscription,
          paid: true,
        }
      }
      return subscription
    })
    selectedSubscriptionToAdd.value = null
  }
}

function payAndClose() {
  createEntry()
  isOpen.value = false
}

const dividerLabel = computed(() => selectedSubscription.value.length > 0 ? 'Edit subscription' : 'Add New Subscription')
</script>

<template>
  <Header>Subscriptions</Header>
  <UTable v-model="selectedSubscription" :rows="subscriptions" :columns="columns" class="mb-6">
    <template #paid-data="{ row }">
      <UBadge :color="row.paid ? 'green' : 'red'" variant="subtle" @click="setSelectedSubscription(row.id)">
        {{ row.paid ? 'Paid' : 'Not Paid' }}
      </UBadge>
    </template>
  </UTable>
  <UBadge color="blue" variant="outline" size="lg">
    Total: <span class="text-secondary-500 font-semibold">¥{{ subscriptions.reduce((acc, row) => acc + row.cost, 0) }}</span>
  </UBadge>
  <UDivider :label="dividerLabel" class="my-4" />
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
  <Halfsheet :is-open="isOpen" @close="isOpen = !isOpen">
    <template #header>
      <div class="text-xl font-semibold">
        Subscription Payment
      </div>
    </template>
    <template #content>
      <div>Add a new entry for this subscription?</div>
      <div class="flex gap-2">
        <h3 class="font-semibold">
          {{ selectedSubscriptionToAdd?.name }}
        </h3>
        <p>for ¥{{ selectedSubscriptionToAdd?.cost }} on</p>
        <p>{{ selectedSubscriptionToAdd?.start_date }}</p>
      </div>
    </template>
    <template #footer>
      <div class="flex flex-row-reverse gap-2">
        <UButton color="red" @click="isOpen = !isOpen">
          Close
        </UButton>
        <UButton @click="payAndClose()">
          Pay
        </UButton>
      </div>
    </template>
  </Halfsheet>
</template>

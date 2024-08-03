<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '#ui/types'
import { format } from 'date-fns'

const schema = v.object({
  price: v.pipe(v.number(), v.integer()),
  category: v.pipe(v.string()),
  notes: v.optional(v.string())
})

type Schema = v.InferOutput<typeof schema>

const state = reactive({
  price: null,
  category: null,
  notes: ""
})

const newCategory = ref("")

const categories = ref(['Eat Out', 'Groceries', 'Transport', 'Entertainment', 'Health', 'Shopping', 'Others'])

const client = useSupabaseClient()
const user = useSupabaseUser()

onMounted(async () => {
  const { data, error } = await client.from("categories").select("*").eq("user_id", user.value.id)

  console.log("data", data)
  if (error) {
    console.log("Error fetching categories", error)
  } else if (data) {
    categories.value = data.map((category: any) => category.title)
  } else {
    categories.value = []
  }
})


async function onSubmit(event: FormSubmitEvent<Schema>) {
  console.log("Submitting form")
  console.log(event.data)
  const { error } = await client.from("expenses").insert({
    price: event.data.price,
    category: event.data.category,
    notes: event.data.notes,
    user_id: user.value.id
  })

  if (error) {
    console.log("Error inserting data", error)
  }
}

async function addCategory() {
  console.log("Adding category", newCategory.value)
  const { error } = await client.from("categories").insert({
    title: newCategory.value,
    user_id: user.value.id
  })

  if (error) {
    console.log("Error adding category", error)
  } else {
    console.log("Added category", newCategory.value)
    categories.value.push(newCategory.value)
    newCategory.value = ""
  }

}

const date = ref(new Date())
watch(date, () => {
  console.log(date.value)
})


</script>

<template>
  <UForm :schema="v.safeParser(schema)" :state="state" class="space-y-4" @submit="onSubmit" :validateOn="['submit']">
    <UFormGroup name="price" size="xl">
      <template #label>
        <div class="flex items-center gap-1">
          <UIcon name="i-iconoir-yen-square-solid" />
          Price
        </div>
      </template>

      <UInput v-model="state.price" type="number" />
    </UFormGroup>

    <UFormGroup name="category" size="xl">
      <template #label>
        <div class="flex items-center gap-1">
          <UIcon name="i-tabler-category-filled" />
          Category
        </div>
      </template>
      <USelect v-model="state.category" :options="categories" />
    </UFormGroup>
    <div class="flex gap-4">
      <UInput color="gray" variant="outline" placeholder="New Category" v-model="newCategory" />
      <UButton @click="addCategory" color="blue" variant="soft" icon="i-material-symbols-add-circle-outline">Add
        Category
      </UButton>
    </div>
    <!-- <UPopover :popper="{ placement: 'bottom-start' }">
      <UButton icon="i-heroicons-calendar-days-20-solid" :label="format(date, 'd MMM, yyy')" variant="soft" />
      <template #panel="{ close }">
        <DatePicker v-model="date" @close="close" />
      </template>
    </UPopover> -->
    <UTextarea v-model="state.notes" placeholder="Notes..." />

    <UButton type="submit">
      Submit
    </UButton>
  </UForm>
</template>

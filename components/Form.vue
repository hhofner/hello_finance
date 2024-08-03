<script setup lang="ts">
import * as v from "valibot";
import type { FormSubmitEvent } from "#ui/types";
import { format } from "date-fns";

const toast = useToast();
const isLoading = ref(false);

const schema = v.object({
    price: v.pipe(v.number(), v.integer()),
    category: v.pipe(v.string()),
    notes: v.optional(v.string()),
    account: v.optional(v.string()),
});

type Schema = v.InferOutput<typeof schema>;

const state = reactive({
    price: null,
    category: null,
    notes: "",
    account: null,
});

const newCategory = ref("");

const categories = ref<Array<string>>([]);
const accounts = ref<Array<string>>([]);

const client = useSupabaseClient();
const user = useSupabaseUser();

onMounted(async () => {
    const { data, error } = await client
        .from("categories")
        .select("*")
        .eq("user_id", user.value.id);

    if (error) {
        console.log("Error fetching categories", error);
    } else if (data) {
        categories.value = data.map((category: any) => category.title);
    } else {
        categories.value = [];
    }

    const { data: accountsData, error: accountsError } = await client
        .from("accounts")
        .select("*")
        .eq("user_id", user.value.id);

    console.log("Accounts", accountsData);
    if (accountsError) {
        console.log("Error fetching accounts", accountsError);
    } else if (accountsData) {
        accounts.value = accountsData.map((account: any) => account.name);
    } else {
        accounts.value = [];
    }
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
    console.log("Submitting form");
    console.log(event.data);
    isLoading.value = true;
    const { error } = await client.from("expenses").insert({
        price: event.data.price,
        category: event.data.category,
        notes: event.data.notes,
        user_id: user.value.id,
    });

    if (error) {
        console.log("Error inserting data", error);
        toast.add({ title: `Error adding expense: ${error}`, color: "red" });
    } else {
        toast.add({ title: "Expense added", color: "green" });
    }
    isLoading.value = false;
}

async function addCategory() {
    console.log("Adding category", newCategory.value);
    isLoading.value = true;
    const { error } = await client.from("categories").insert({
        title: newCategory.value,
        user_id: user.value.id,
    });

    if (error) {
        console.log("Error adding category", error);
        toast.add({
            title: `Error adding category \"${error}\"`,
            color: "red",
        });
    } else {
        console.log("Added category", newCategory.value);
        const temp = newCategory.value;
        categories.value.push(newCategory.value);
        newCategory.value = "";
        toast.add({ title: `Added new category \"${temp}\"`, color: "blue" });
    }
    isLoading.value = false;
}

const date = ref(new Date());
watch(date, () => {
    console.log(date.value);
});
</script>

<template>
    <UForm
        :schema="v.safeParser(schema)"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
        :validateOn="['submit']"
    >
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
            <UInput
                color="gray"
                variant="outline"
                placeholder="New Category"
                v-model="newCategory"
            />
            <UButton
                @click="addCategory"
                :disabled="isLoading"
                color="blue"
                variant="soft"
                icon="i-material-symbols-add-circle-outline"
            >
                Add Category
            </UButton>
        </div>
        <UFormGroup name="accounts" size="xl">
            <template #label>
                <div class="flex items-center gap-1">
                    <UIcon name="i-tabler-credit-card" />
                    Account
                </div>
            </template>
            <USelect v-model="state.account" :options="accounts" />
        </UFormGroup>
        <!-- <UPopover :popper="{ placement: 'bottom-start' }">
      <UButton icon="i-heroicons-calendar-days-20-solid" :label="format(date, 'd MMM, yyy')" variant="soft" />
      <template #panel="{ close }">
        <DatePicker v-model="date" @close="close" />
      </template>
    </UPopover> -->
        <UTextarea v-model="state.notes" size="xl" placeholder="Notes..." />

        <UButton type="submit" :disabled="isLoading"> Submit </UButton>
    </UForm>
</template>

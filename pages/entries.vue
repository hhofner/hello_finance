<script setup lang="ts">
const user = useSupabaseUser();
const client = useSupabaseClient();
const toast = useToast();

const columns = [
    {
        key: "created_at",
        label: "Date",
    },
    {
        key: "price",
        label: "Price",
    },
    {
        key: "category",
        label: "Category",
    },
    {
        key: "notes",
        label: "Notes",
    },
];
const entries = ref([]);

onMounted(async () => {
    const { data, error } = await client
        .from("expenses")
        .select("*")
        .eq("user_id", user.value.id)
        .range(0, 10);

    console.log("data", data);
    if (error) {
        console.error(error);
        toast.add({
            title: `Error fetching entries: ${JSON.stringify(error)}`,
            color: "red",
        });
    } else {
        entries.value = data.map((entry) => {
            return {
                ...entry,
                price: `¥${entry.price}`,
                created_at: new Date(entry.created_at).toLocaleDateString(),
            };
        });
    }
});
</script>

<template>
    <UTable :rows="entries" :columns="columns" />
</template>

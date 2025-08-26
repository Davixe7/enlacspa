<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'

const props = defineProps(['candidateId'])
const loading = ref(false)
const rows = ref([])
const columns = ref([
  { align: 'left', name: 'name', label: 'Medicamento', field: (row) => row.medication.name },
  { align: 'left', name: 'dose', label: 'Dosis', field: 'dose' },
  {
    align: 'left',
    name: 'status',
    label: 'Cambio a',
    field: (row) => (row.status ? 'activo' : 'inactivo')
  },
  { align: 'left', name: 'created_at', label: 'Fecha', field: 'created_at' }
])

async function fetchLogs() {
  try {
    loading.value = true
    rows.value = (await api.get(`medication_logs/${props.candidateId}`)).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchLogs()
})
</script>

<template>
  <q-table
    bordered
    flat
    :rows="rows"
    :columns="columns"
    :pagination="{ rowsPerPage: 0 }"
    hide-bottom
  />
</template>

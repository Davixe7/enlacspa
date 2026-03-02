<script setup>
import { api } from 'src/boot/axios';
import { ref, watch, onMounted } from 'vue';
import { date } from 'quasar';
import EnlacDate from 'src/components/EnlacDate.vue';
import BeneficiarySelect from 'src/components/BeneficiarySelect.vue';

const today = new Date()
const startDate = ref(date.formatDate(date.subtractFromDate(today, { months: 1 })))
const endDate = ref(date.formatDate(today, 'YYYY-MM-DD'))
const candidateId = ref(null)

const statuses = ref({})
const loading = ref(false)
const rows = ref([])
const columns = [
  { name: 'date', label: 'Fecha', field: 'created_at', align: 'left' },
  { name: 'name', label: 'Beneficiario', field: row => row.candidate?.full_name, align: 'left' },
  { name: 'name', label: 'Autor', field: row => row.author?.full_name ?? 'No disponible', align: 'left' },
  { name: 'status', label: 'Estatus', field: row => statuses.value.get(row.status), align: 'left' }
];

async function fetchRows() {
  try {
    loading.value = true
    let params = {
      start_date: startDate.value,
      end_date: endDate.value,
      candidate_id: candidateId.value
    }
    let response = (await api.get('candidate_statuses')).data.data
    statuses.value = new Map(response.map(s => [s.value, s.label]))
    rows.value = (await api.get('candidate_status_logs', { params })).data.data
  } catch (error) {
    console.log(error);
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRows()
})

watch(startDate, () => fetchRows())
watch(endDate, () => fetchRows())
watch(candidateId, () => fetchRows())
</script>

<template>
  <q-page>
    <h1 class="page-title">Historico de Cambios de Estado del Beneficiario</h1>
    <div class="row q-mb-lg">
      <div class="col-12 col-md-6 flex items-end q-gutter-x-md">
        <enlac-date v-model="startDate" />
        <enlac-date v-model="endDate" />
        <beneficiary-select v-model="candidateId" />
      </div>
    </div>

    <q-table :pagination="{ rowsPerPage: 0 }" :rows="rows" :columns="columns" flat bordered></q-table>
  </q-page>
</template>

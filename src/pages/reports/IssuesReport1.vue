<script setup>
import { onMounted, ref, watch } from 'vue'
import { api } from 'src/boot/axios'

const loading = ref(false)
const rows = ref([])
const props = defineProps(['candidateId', 'date'])

async function fetchIssues() {
  try {
    console.log('Consultando incidencias del dia para ' + props.candidateId + ' ' + props.date);
    loading.value = true
    rows.value = (await api.get(`issues/?candidate_id=${props.candidateId}&date=${props.date}`)).data.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
watch(() => props.date, (newDate, oldDate) => {
  if (newDate !== oldDate) {
    fetchIssues()
  }
})

const subjects = [
  {
    id: 1,
    label: 'Alimentación'
  },
  {
    id: 2,
    label: 'Retardo'
  },
  {
    id: 3,
    label: 'Higiene'
  },
  {
    id: 4,
    label: 'Falta a Cita Médica'
  },
  {
    id: 5,
    label: 'Falta a Cita Nutrición'
  },
  {
    id: 6,
    label: 'Falta a Cita Psicología'
  },
  {
    id: 7,
    label: 'Falta a Cita Comunicación'
  },
  {
    id: 8,
    label: 'Falta a Capacitación'
  },
  {
    id: 9,
    label: 'Falta a Reunión de Padres'
  },
  {
    id: 10,
    label: 'Falta Actividades de Recaudación de Fondos'
  },
  {
    id: 11,
    label: 'Indisciplina'
  },
  {
    id: 12,
    label: 'Otro'
  }
]


const columns = [
  { name: 'category', label: 'Área', field: row => row.plan_category?.label, align: 'left' },
  {
    name: 'type',
    label: 'Asunto',
    field: row => subjects[row.type - 1]?.label || 'Desconocido',
    align: 'left'
  },
  { name: 'date', label: 'Fecha Reportada', field: 'date', align: 'left' },
  { name: 'user', label: 'Reportó', field: row => row.user?.name, align: 'left' },
  { name: 'comments', label: 'Comentarios', field: 'comments', align: 'left' },
  { name: 'status', label: 'Estado', align: 'left' }
]

onMounted(() => fetchIssues())
</script>

<template>
  <div>
    <div class="flex q-mb-md">
      <h1 class="page-title q-mb-none">Incidencias</h1>
    </div>
    <q-table flat bordered :rows="rows" :columns="columns" :loading="loading" :pagination="{ rowsPerPage: 0 }"
      row-key="id" class="q-mb-xl" />
  </div>
</template>
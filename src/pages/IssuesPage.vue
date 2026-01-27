<script setup>
import { api } from 'src/boot/axios'
import { ref, onMounted } from 'vue'
import EnlacDate from 'src/components/EnlacDate.vue'
import notify from 'src/utils/notify'

const dateISO = ref(new Date().toISOString().split('T')[0])
const loading = ref(false)
const rows = ref([])

const columns = ref([
  { name: 'work_area_id', label: 'Area', field: 'work_area_id', align: 'left' },
  {
    name: 'type',
    label: 'Asunto',
    field: (row) => subjects.value[row.type - 1]?.label || 'Desconocido',
    align: 'left'
  },
  { name: 'date', label: 'Fecha Reportada', field: 'date', align: 'left' },
  { name: 'user', label: 'Reporto', field: (row) => row.user.name, align: 'left' },
  { name: 'comments', label: 'Comentarios', field: 'comments', align: 'left' },
  { name: 'status', label: 'Estado', align: 'left' }
])

const subjects = ref([
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
])

async function fetchIssues() {
  // Lógica para obtener los issues desde la API
  try {
    loading.value = true
    rows.value = (await api.get(`issues/?date=${dateISO.value}`)).data.data
    notify.positive('Incidencias cargadas con exito')
  } catch (error) {
    console.log(error)
    notify.negative('No se pudieron cargar las incidencias')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchIssues()
})
</script>

<template>
  <q-page class="q-pa-md">
    <div class="flex q-mb-md">
      <h1 class="page-title q-mb-none">Incidencias</h1>
      <enlac-date
        v-model="dateISO"
        class="q-ml-auto"
        @update:model-value="fetchIssues"
      />
    </div>
    <q-table
      flat
      bordered
      :rows="rows"
      :columns="columns"
      :loading="loading"
      :pagination="{ rowsPerPage: 0 }"
      row-key="id"
    />
  </q-page>
</template>

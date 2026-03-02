<script setup>
import { api } from 'src/boot/axios'
import { ref, onMounted, computed, watch } from 'vue'
import EnlacDate from 'src/components/EnlacDate.vue'
import BeneficiarySelect from 'src/components/BeneficiarySelect.vue'
import notify from 'src/utils/notify'

const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])
const candidateId = ref(null)

const loading = ref(false)
const rows = ref([])

const subjectsMap = computed(() => new Map(subjects.value.map(s => [s.id, s.label])))

const columns = ref([
  { name: 'candidate.full_name', label: 'Nombre del beneficiario', field: row => row.candidate.full_name, align: 'left' },
  { name: 'category', label: 'Área', field: row => row.plan_category.label, align: 'left' },
  { name: 'date', label: 'Fecha Reportada', field: 'date', align: 'left' },
  { name: 'user', label: 'Reportó', field: (row) => row.user.name, align: 'left' },
  {
    name: 'type',
    label: 'Tipo',
    field: (row) => subjectsMap.value.get(row.type) || 'Desconocido',
    align: 'left'
  },
  { name: 'comments', label: 'Comentarios', field: 'comments', align: 'left' },
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
  try {
    loading.value = true
    const params = {
      start_date: startDate.value,
      end_date: endDate.value
    }
    if (candidateId.value) {
      params.candidate_id = candidateId.value
    }
    const response = await api.get('issues/', { params })
    rows.value = response.data.data
    notify.positive('Incidencias cargadas con éxito')
  } catch (error) {
    console.error('Error fetching issues:', error)
    notify.negative('No se pudieron cargar las incidencias')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchIssues()
})

watch(candidateId, () => fetchIssues())

async function exportXls() {
  try {
    loading.value = true
    let downloadurl = 'issues/export'
    const params = {
      start_date: startDate.value,
      end_date: endDate.value
    }
    if (candidateId.value) {
      params.candidate_id = candidateId.value
    }

    let response = await api({
      url: downloadurl,
      method: 'GET',
      responseType: 'blob',
      params
    })

    const contentDisposition = response.headers['content-disposition']
    let filename = 'reporte_de_incidencias_' + startDate.value + '_' + endDate.value + '.xlsx'

    if (contentDisposition) {
      // Ejemplo: attachment; filename="usuarios.xlsx"
      const filenameMatch = contentDisposition.match(/filename="(.+?)"/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1]
      }
    }

    // 3. Crear el Blob a partir de los datos de la respuesta
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] // Usar el tipo MIME correcto
    })

    // 4. Iniciar la descarga usando el API del navegador
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.setAttribute('download', filename) // 👈 Aplicar el nombre del archivo
    document.body.appendChild(link)
    link.click() // 👈 Forzar el click para iniciar la descarga

    // 5. Limpieza
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url) // Liberar memoria del Blob

    console.log(`Descarga de ${filename} iniciada.`)
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-page class="q-pa-md">
    <h1 class="page-title">Incidencias</h1>
    <div class="row q-mb-md justify-between items-end">
      <div class="col-12 col-md-6 flex items-end">
        <BeneficiarySelect v-model="candidateId" class="q-mr-md" />
        <enlac-date v-model="startDate" class="q-mr-md" @update:model-value="fetchIssues" />
        <enlac-date v-model="endDate" @update:model-value="fetchIssues" />
      </div>

      <div>
        <q-btn outline color="primary" icon="file_download" label="Exportar Excel" @click="exportXls" />
      </div>
    </div>
    <q-table flat bordered :rows="rows" :columns="columns" :loading="loading" :pagination="{ rowsPerPage: 0 }"
      row-key="id" />
  </q-page>
</template>

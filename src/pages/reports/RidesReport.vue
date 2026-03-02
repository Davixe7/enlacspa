<script setup>
import { api } from 'src/boot/axios';
import { computed, ref, watch, onMounted } from 'vue';
import EnlacDate from 'src/components/EnlacDate.vue';
import BeneficiarySelect from 'src/components/BeneficiarySelect.vue';

const loading = ref(false)
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])
const candidateId = ref(null)

const rawRows = ref([])
const rows = computed(() => {
  const newRows = []

  rawRows.value.forEach(row => {
    if (row.departure_time) {
      newRows.push({
        ...row,
        destino: 'ENLAC',
        rowId: `${row.id}-ida`
      })
    }
    if (row.return_time) {
      newRows.push({
        ...row,
        destino: 'DOMICILIO',
        rowId: `${row.id}-regreso`
      })
    }
  })

  return newRows
})

const columns = [
  {
    name: 'date',
    label: 'Fecha',
    field: 'date',
    align: 'left',
    sortable: true
  },
  {
    name: 'candidate_name',
    label: 'Beneficiario',
    field: row => row.candidate?.full_name || 'N/A',
    align: 'left'
  },
  {
    name: 'curp',
    label: 'CURP del Beneficiario',
    field: row => row.candidate?.location_detail?.curp || 'N/A',
    align: 'left'
  },
  {
    name: 'address',
    label: 'Localidad o Domicilio',
    field: row => row.candidate?.location_detail?.transport_address || 'Sin dirección',
    align: 'left'
  },
  {
    name: 'destino',
    label: 'Destino',
    field: 'destino',
    align: 'center',
    format: val => val.toUpperCase()
  }
]

async function fetchRides() {
  try {
    loading.value = true
    let params = {
      type: 'rubio',
      start_date: startDate.value,
      end_date: endDate.value
    }
    if (candidateId.value) params.candidate_id = candidateId.value
    rawRows.value = (await api.get('rides', { params })).data.data
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchRides())
watch(candidateId, () => fetchRides())
watch(startDate, () => fetchRides())
watch(endDate, () => fetchRides())

async function exportXls() {
  try {
    loading.value = true
    let downloadurl = 'rides/export'
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
    let filename = 'reporte_de_traslados_' + startDate.value + '_' + endDate.value + '.xlsx'

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
  <q-page>
    <h1 class="page-title q-mb-md">
      Bitácora de Servicios de Traslados
    </h1>

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

    <q-table :rows="rows" :columns="columns"></q-table>
  </q-page>
</template>

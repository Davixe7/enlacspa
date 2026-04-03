<script setup>
import { api } from 'src/boot/axios'
import { computed, ref, watch, onMounted } from 'vue'
import EnlacDate from 'src/components/EnlacDate.vue'
import BeneficiarySelect from 'src/components/BeneficiarySelect.vue'
import { exportXlsFile } from 'src/utils/exportXls'

const loading = ref(false)
const startDate = ref('')
const endDate = ref(new Date().toISOString().split('T')[0])
const candidateId = ref(null)

const rawRows = ref([])
const rows = computed(() => {
  const newRows = []

  rawRows.value.forEach((row) => {
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
    name: 'index',
    label: 'NO',
    align: 'left',
    sortable: true
  },
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
    field: (row) => row.candidate?.full_name || 'N/A',
    align: 'left'
  },
  {
    name: 'curp',
    label: 'CURP del Beneficiario',
    field: (row) => row.candidate?.location_detail?.curp || 'N/A',
    align: 'left'
  },
  {
    name: 'address',
    label: 'Localidad o Domicilio',
    field: (row) => row.candidate?.location_detail?.transport_address || 'Sin dirección',
    align: 'left'
  },
  {
    name: 'destino',
    label: 'Destino',
    field: 'destino',
    align: 'center',
    format: (val) => val.toUpperCase()
  },
  {
    name: 'phones',
    label: 'Celular del beneficiario y/o de su familiar',
    field: 'phones',
    align: 'left'
  },
  {
    name: 'diagnosis',
    label: 'Nombre discapacidad del beneficiario',
    field: (row) => row.candidate.diagnosis,
    align: 'left'
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
    rawRows.value = (await api.get('reports/rides', { params })).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchRides())
watch(candidateId, () => fetchRides())
watch(startDate, () => fetchRides())
watch(endDate, () => fetchRides())

async function exportXls() {
  loading.value = true
  try {
    const params = {
      start_date: startDate.value,
      end_date: endDate.value
    }
    if (candidateId.value) {
      params.candidate_id = candidateId.value
    }
    await exportXlsFile(
      'reports/rides/export',
      params,
      'reporte_de_traslados_' + startDate.value + '_' + endDate.value + '.xlsx'
    )
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  const start = new Date()
  start.setDate(start.getDate() - 30)
  startDate.value = start.toISOString().split('T')[0]
})
</script>

<template>
  <q-page>
    <h1 class="page-title q-mb-md">Bitácora de Servicios de Traslados</h1>

    <div class="row q-mb-md justify-between items-end">
      <div class="col-12 col-md-6 flex items-end">
        <BeneficiarySelect
          v-model="candidateId"
          class="q-mr-md"
        />
        <enlac-date
          v-model="startDate"
          class="q-mr-md"
        />
        <enlac-date v-model="endDate" />
      </div>

      <div>
        <q-btn
          outline
          color="primary"
          icon="file_download"
          label="Exportar Excel"
          @click="exportXls"
        />
      </div>
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
    >
      <template v-slot:body-cell-index="props">
        <q-td>{{ props.rowIndex + 1 }}</q-td>
      </template>
    </q-table>
  </q-page>
</template>

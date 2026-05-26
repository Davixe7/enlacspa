<script setup>
import { ref, onMounted, watch } from 'vue'
import { api } from 'src/boot/axios'
import { useRouter } from 'vue-router'
import notify from 'src/utils/notify'
import { exportXlsFile } from 'src/utils/exportXls'

const loading = ref(false)
const rows = ref([])
const $router = useRouter()

// Filtros Reactivos con placeholders puros
const dateFrom = ref('')
const dateTo = ref('')
const selectedActivity = ref(null)

// Opciones para el catálogo de tipos de actividad
const activityTypes = [
  'Alcancía',
  'Alianza',
  'Boteo',
  'Donativos Varios',
  'Fundaciones',
  'Natación',
  'Obsequio entre Amigos',
  'Organismos de Gobierno',
  'Programa de Verano',
  'Proyecto Interno',
  'Radiomaratón'
]

// Estructura de Columnas solicitada
const columns = [
  {
    name: 'responsible_name',
    label: 'CONTACTO ENLAC RESPONSABLE',
    align: 'left',
    field: (row) => (row.responsible ? row.responsible.full_name : 'N/A'),
    sortable: true,
    sort: (a, b) => a.localeCompare(b)
  },
  {
    name: 'sector',
    label: 'SECTOR',
    align: 'left',
    field: (row) => (row.donor ? row.donor.sector : 'N/A'),
    sortable: true
  },
  {
    name: 'donor_name',
    label: 'DONANTE',
    align: 'left',
    field: (row) => {
      if (!row.donor) return 'N/A'
      return `${row.donor.first_name || ''} ${row.donor.last_name || ''}`.trim()
    },
    sortable: true
  },
  {
    name: 'company_name',
    label: 'EMPRESA',
    align: 'left',
    field: (row) => (row.donor ? row.donor.company_name : 'N/A'),
    sortable: true
  },
  {
    name: 'visit_date',
    label: 'FECHA DE LA VISITA',
    align: 'left',
    field: 'visit_date',
    sortable: true
  },
  {
    name: 'received_by',
    label: 'PERSONA QUE RECIBE',
    align: 'left',
    field: 'received_by',
    sortable: true
  },
  {
    name: 'schedule_contact_phone',
    label: 'TELÉFONO DEL CONTACTO',
    align: 'left',
    field: 'schedule_contact_phone'
  },
  {
    name: 'last_radiomaraton',
    label: 'ÚLTIMO DONATIVO RADIOMARATÓN',
    align: 'right',
    field: 'last_radiomaraton_amount',
    sortable: true
  }
]

function formatVisitDate(isoString) {
  if (!isoString) return 'N/A'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

async function fetchVisitsReport() {
  try {
    loading.value = true
    const params = {}

    if (dateFrom.value) params.date_from = dateFrom.value
    if (dateTo.value) params.date_to = dateTo.value
    if (selectedActivity.value) params.activity_type = selectedActivity.value

    const response = await api.get('/reports/visits', { params })
    rows.value = response.data.data || response.data || []
  } catch (error) {
    console.error(error)
    notify.negative('No se pudo obtener el reporte de visitas')
  } finally {
    loading.value = false
  }
}

function clearFilters() {
  dateFrom.value = ''
  dateTo.value = ''
  selectedActivity.value = null
}

async function exportXls() {
  loading.value = true
  try {
    await exportXlsFile(
      '/reports/visits/export',
      {
        date_from: dateFrom.value,
        date_to: dateTo.value,
        activity_type: selectedActivity.value
      },
      `Reporte_Visitas_${dateFrom.value || 'Inicio'}_al_${dateTo.value || 'Fin'}.xlsx`
    )
  } catch (error) {
    notify.negative('Error al descargar el archivo Excel')
    console.error(error)
  } finally {
    loading.value = false
  }
}

watch([dateFrom, dateTo, selectedActivity], () => {
  fetchVisitsReport()
})

onMounted(() => {
  fetchVisitsReport()
})
</script>

<template>
  <q-page class="q-pa-lg bg-grey-3">
    <div class="row items-center q-mb-md">
      <q-btn
        flat
        round
        color="grey-7"
        icon="arrow_back"
        @click="$router.go(-1)"
        class="q-mr-sm"
      />
      <h1 class="text-h5 text-weight-bold q-my-none text-dark">Reporte de Visitas</h1>

      <q-space />

      <q-btn
        unelevated
        color="primary"
        icon="sym_o_file_download"
        label="Exportar Excel"
        @click="exportXls"
        :loading="loading"
      />
    </div>

    <q-card
      flat
      bordered
      class="q-mb-lg"
    >
      <q-card-section class="row q-col-gutter-md items-center">
        <div class="col-12 col-sm-6 col-md-3">
          <q-input
            v-model="dateFrom"
            outlined
            dense
            bg-color="white"
            type="date"
            hint="Fecha inicio (Desde)"
            clearable
          />
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <q-input
            v-model="dateTo"
            outlined
            dense
            bg-color="white"
            type="date"
            hint="Fecha fin (Hasta)"
            clearable
          />
        </div>

        <div class="col-12 col-md-4">
          <q-select
            v-model="selectedActivity"
            :options="activityTypes"
            outlined
            dense
            bg-color="white"
            hint="Seleccionar Tipo de Actividad"
            clearable
          />
        </div>

        <div class="col-12 col-md-2 text-right">
          <q-btn
            flat
            color="negative"
            label="Limpiar Filtros"
            icon="sym_o_filter_alt_off"
            @click="clearFilters"
            :disable="!dateFrom && !dateTo && !selectedActivity"
          />
        </div>
      </q-card-section>
    </q-card>

    <q-card
      flat
      bordered
    >
      <q-card-section class="q-pa-none">
        <q-table
          :rows="rows"
          :columns="columns"
          :loading="loading"
          :pagination="{ rowsPerPage: 15 }"
          flat
        >
          <template v-slot:body-cell-visit_date="props">
            <q-td :props="props">
              {{ formatVisitDate(props.row.visit_date) }}
            </q-td>
          </template>

          <template v-slot:body-cell-last_radiomaraton="props">
            <q-td
              :props="props"
              class="text-weight-bold"
            >
              <span
                v-if="props.value"
                class="text-positive"
              >
                $ {{ props.value }}
              </span>
              <span
                v-else
                class="text-grey-5 text-weight-regular"
              >
                Sin historial
              </span>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center text-grey-6 q-py-xl">
              <q-icon
                name="sym_o_calendar_today"
                size="md"
                class="q-mr-sm"
              />
              <span>No se encontraron bitácoras de visitas con los filtros aplicados.</span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

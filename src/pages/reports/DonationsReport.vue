<script setup>
import { ref, onMounted, watch } from 'vue'
import { api } from 'src/boot/axios'
import { useRouter } from 'vue-router'
import notify from 'src/utils/notify'

const loading = ref(false)
const rows = ref([])
const $router = useRouter()

function clearFilters() {
  dateFrom.value = ''
  dateTo.value = ''
  searchDonor.value = ''
}

// Filtros Reactivos solicitados por el usuario
const dateFrom = ref('')
const dateTo = ref('')
const searchDonor = ref('')

// Definición estructural de columnas para Quasar QTable
const columns = [
  {
    name: 'donor_name',
    label: 'NOMBRE DEL DONANTE',
    align: 'left',
    field: (row) => {
      if (!row.donor) return 'N/A'
      if (row.donor.full_name) return row.donor.full_name
      return `${row.donor.first_name || ''} ${row.donor.last_name || ''}`.trim()
    },
    sortable: true
  },
  {
    name: 'activity_type',
    label: 'TIPO DE ACTIVIDAD',
    align: 'left',
    field: 'activity_type',
    sortable: true
  },
  {
    name: 'concept',
    label: 'NOMBRE ACTIVIDAD / CONCEPTO',
    align: 'left',
    field: 'concept',
    sortable: true
  },
  {
    name: 'folio_number',
    label: 'NO. FOLIO',
    align: 'left',
    field: 'folio_number',
    sortable: true
  },
  {
    name: 'tax_receipt',
    label: 'NO. RECIBO DEDUCIBLE',
    align: 'left',
    field: (row) => (row.has_tax_receipt ? row.tax_receipt_number || 'Sí (Sin folio)' : 'No'),
    sortable: true
  },
  {
    name: 'payment_date',
    label: 'FECHA DE PAGO',
    align: 'left',
    field: 'payment_date',
    sortable: true
  },
  {
    name: 'payment_method',
    label: 'FORMA DE PAGO',
    align: 'left',
    field: 'payment_method',
    sortable: true
  },
  { name: 'amount', label: 'MONTO PAGADO', align: 'right', field: 'amount', sortable: true }
]

function formatPaymentDate(isoString) {
  if (!isoString) return 'N/A'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString
  return date.toLocaleDateString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

async function fetchDonationsReport() {
  try {
    loading.value = true

    const params = {}
    if (dateFrom.value) params.date_from = dateFrom.value
    if (dateTo.value) params.date_to = dateTo.value
    if (searchDonor.value) params.search_donor = searchDonor.value

    const response = await api.get('/reports/donations', { params })
    rows.value = response.data.data || response.data || []
  } catch (error) {
    console.error(error)
    notify.negative('No se pudo obtener el reporte de donativos')
  } finally {
    loading.value = false
  }
}

// Escucha activa de filtros para recargar automáticamente
watch([dateFrom, dateTo, searchDonor], () => {
  fetchDonationsReport()
})

onMounted(() => {
  fetchDonationsReport()
})
</script>

<template>
  <q-page class="q-pa-lg bg-grey-3">
    <!-- Botón de regreso y Título -->
    <div class="row items-center q-mb-md">
      <q-btn
        flat
        round
        color="grey-7"
        icon="arrow_back"
        @click="$router.go(-1)"
        class="q-mr-sm"
      />
      <h1 class="text-h5 text-weight-bold q-my-none text-dark">Reporte General de Donativos</h1>
    </div>

    <!-- Panel de Filtros -->
    <!-- Panel de Filtros -->
    <q-card
      flat
      bordered
      class="q-mb-lg"
    >
      <q-card-section class="row q-col-gutter-md items-center">
        <!-- Filtro 1: Nombre Donante -->
        <div class="col-12 col-md-4">
          <q-input
            v-model="searchDonor"
            outlined
            dense
            bg-color="white"
            placeholder="Buscar por nombre de donante..."
            debounce="400"
            clearable
          >
            <template v-slot:append>
              <q-icon name="sym_o_search" />
            </template>
          </q-input>
        </div>

        <!-- Filtro 2: Fecha Desde -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-input
            v-model="dateFrom"
            outlined
            dense
            bg-color="white"
            type="date"
            placeholder="Fecha inicio (Desde)"
            clearable
          />
        </div>

        <!-- Filtro 3: Fecha Hasta -->
        <div class="col-12 col-sm-6 col-md-3">
          <q-input
            v-model="dateTo"
            outlined
            dense
            bg-color="white"
            type="date"
            placeholder="Fecha fin (Hasta)"
            clearable
          />
        </div>

        <!-- Botón de Limpieza Rápida -->
        <div class="col-12 col-md-2 text-right">
          <q-btn
            flat
            color="negative"
            label="Limpiar Filtros"
            icon="sym_o_filter_alt_off"
            @click="clearFilters"
            :disable="!dateFrom && !dateTo && !searchDonor"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Tabla de Resultados -->
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
          <template v-slot:body-cell-payment_date="props">
            <q-td :props="props">
              {{ formatPaymentDate(props.row.payment_date) }}
            </q-td>
          </template>

          <template v-slot:body-cell-tax_receipt="props">
            <q-td :props="props">
              <q-badge :color="props.row.has_tax_receipt ? 'positive' : 'grey-5'">
                {{ props.value }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-amount="props">
            <q-td
              :props="props"
              class="text-weight-bold text-primary"
            >
              $ {{ props.row.amount }} <small class="text-grey-6">{{ props.row.currency }}</small>
            </q-td>
          </template>

          <template v-slot:no-data>
            <div class="full-width row flex-center text-grey-6 q-py-xl">
              <q-icon
                name="sym_o_money_off"
                size="md"
                class="q-mr-sm"
              />
              <span>No se encontraron donativos con los filtros seleccionados.</span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

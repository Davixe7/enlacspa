<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref, watch } from 'vue'
import notify from 'src/utils/notify'
import DonorKardexModal from 'components/DonorKardexModal.vue'
import ApplyDonationDialog from 'components/ApplyDonationDialog.vue'

const loading = ref(false)
const rows = ref([])
const donationDialog = ref(null)

// Filtros reactivos en el Frontend
const filterName = ref('')
const selectedActivityId = ref(null)
const selectedMonth = ref(null)

// Control del mega modal del Kardex
const kardexModalRef = ref(null)

const columns = ref([
  {
    align: 'left',
    name: 'donor_name',
    label: 'NOMBRE DEL DONANTE',
    field: (row) => {
      if (row.full_name) return row.full_name
      const first = row.first_name || ''
      const last = row.last_name || ''
      const second = row.second_last_name || ''
      const finalName = `${first} ${last} ${second}`.trim()
      return finalName || 'Donante Sin Nombre'
    },
    sortable: true
  },
  { align: 'left', name: 'company_name', label: 'EMPRESA', field: 'company_name', sortable: true },
  { align: 'left', name: 'job_title', label: 'PUESTO', field: 'job_title', sortable: true },
  { align: 'left', name: 'cellphone', label: 'TELÉFONO CELULAR', field: 'cellphone' },
  {
    align: 'left',
    name: 'birth_date',
    label: 'FECHA DE CUMPLEAÑOS',
    field: 'birth_date',
    sortable: true
  },
  { align: 'left', name: 'sector', label: 'SECTOR', field: 'sector', sortable: true },
  { align: 'center', name: 'is_active', label: 'ESTATUS' },
  { align: 'right', name: 'actions', label: 'ACCIONES' }
])

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

// Listado de los 12 meses para el filtro de cumpleaños
const monthsOptions = [
  { label: 'Enero', value: '01' },
  { label: 'Febrero', value: '02' },
  { label: 'Marzo', value: '03' },
  { label: 'Abril', value: '04' },
  { label: 'Mayo', value: '05' },
  { label: 'Junio', value: '06' },
  { label: 'Julio', value: '07' },
  { label: 'Agosto', value: '08' },
  { label: 'Septiembre', value: '09' },
  { label: 'Octubre', value: '10' },
  { label: 'Noviembre', value: '11' },
  { label: 'Diciembre', value: '12' }
]

function openDonation() {
  donationDialog.value.open()
}

async function fetchInitialData() {
  await fetchDonors()
}

async function fetchDonors() {
  try {
    loading.value = true
    const url = '/donors'

    const params = {}
    if (selectedActivityId.value) params.activity_type = selectedActivityId.value
    if (selectedMonth.value) params.birth_month = selectedMonth.value.value
    if (filterName.value) params.search = filterName.value

    const response = await api.get(url, { params })

    // Al usar response.json($donors) en Laravel, la data viene directamente en response.data
    let data = response.data.data || response.data || []

    // Mantener orden alfabético seguro en el front
    rows.value = [...data].sort((a, b) => {
      const nameA = a.full_name || a.first_name || ''
      const nameB = b.full_name || b.first_name || ''
      return nameA.localeCompare(nameB)
    })
  } catch (error) {
    console.error(error)
    notify.negative('No se pudieron obtener los donantes')
  } finally {
    loading.value = false
  }
}

// Switch Activo / Inactivo tolerando booleanos planos
async function toggleStatus(row) {
  try {
    const route = `/donors/${row.id}/toggle-status`
    await api.post(route, { is_active: row.is_active })
    notify.positive('Estatus actualizado con éxito')
  } catch (error) {
    console.error(error)
    notify.negative('No se pudo guardar el cambio de estatus')
    row.is_active = !row.is_active
  }
}

// Lógica de exportación básica (CSV) que puedes expandir
function exportData() {
  if (rows.value.length === 0) {
    notify.warning('No hay datos disponibles para exportar')
    return
  }
  notify.info('Preparando la descarga del reporte...')
  // Aquí puedes integrar XLSX, un CSV manual o redireccionar a tu ruta de Laravel de Excel
  console.log('Exportando donantes...', rows.value)
}

// Métodos vacíos para los futuros reportes solicitados
function openDonationsReport() {
  notify.info('Módulo de Reporte de Donativos (Próximamente)')
}

function openVisitsReport() {
  notify.info('Módulo de Reporte de Visitas (Próximamente)')
}

function openCreate() {
  kardexModalRef.value.open()
}

function openEdit(row) {
  kardexModalRef.value.open(row)
}

// Observadores para recargar automáticamente cuando cambien los selectores
watch([selectedActivityId, selectedMonth, filterName], () => {
  fetchDonors()
})

onMounted(() => {
  fetchInitialData()
})
</script>

<template>
  <!-- Encabezado Principal -->
  <div class="flex items-center q-mb-md">
    <div>
      <h1 class="page-title q-mb-none">Donantes para Procuración de Fondos</h1>
    </div>

    <div class="flex items-center q-gutter-x-sm q-ml-auto">
      <q-btn
        icon="sym_o_add_card"
        color="primary"
        label="Aplicar Donativo"
        @click="openDonation"
      />
      <q-btn
        icon="sym_o_person_add"
        color="primary"
        label="Nuevo Donante"
        @click="openCreate"
      />
    </div>
  </div>

  <!-- Enlaces de Control Superiores -->
  <div class="flex items-center q-gutter-x-md q-mb-md text-subtitle2">
    <a
      href="javascript:void(0)"
      class="text-primary text-weight-bold row items-center no-underline custom-link"
      @click="openDonationsReport"
    >
      <q-icon
        name="sym_o_analytics"
        class="q-mr-xs"
        size="xs"
      />
      Reporte Donativos
    </a>
    <q-separator
      vertical
      inset
    />
    <a
      href="javascript:void(0)"
      class="text-primary text-weight-bold row items-center no-underline custom-link"
      @click="openVisitsReport"
    >
      <q-icon
        name="sym_o_calendar_month"
        class="q-mr-xs"
        size="xs"
      />
      Reporte de Visitas
    </a>
    <q-space />
    <q-btn
      flat
      dense
      color="grey-7"
      icon="sym_o_download"
      label="Exportar"
      class="text-weight-bold"
      @click="exportData"
    />
  </div>

  <!-- Barra de Filtros Avanzada -->
  <div class="row q-col-gutter-md q-mb-lg justify-start">
    <div class="col-12 col-md-7 row q-col-gutter-sm items-center">
      <!-- 1. Filtro por Nombre / Empresa -->
      <div class="col-12 col-sm-4">
        <q-input
          v-model="filterName"
          outlined
          dense
          bg-color="white"
          placeholder="Buscar por nombre..."
          clearable
          debounce="400"
          hide-bottom-space
        >
          <template v-slot:append>
            <q-icon name="sym_o_search" />
          </template>
        </q-input>
      </div>

      <!-- 2. Filtro por Actividad -->
      <div class="col-12 col-sm-4">
        <q-select
          outlined
          dense
          bg-color="white"
          v-model="selectedActivityId"
          :options="activityTypes"
          placeholder="Todos los tipos"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          clearable
          hide-bottom-space
        />
      </div>

      <!-- 3. Filtro por Mes de Cumpleaños -->
      <div class="col-12 col-sm-4">
        <q-select
          outlined
          dense
          bg-color="white"
          v-model="selectedMonth"
          :options="monthsOptions"
          option-label="label"
          option-value="value"
          placeholder="Cualquier mes"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          clearable
          hide-bottom-space
        />
      </div>
    </div>
  </div>

  <!-- Tabla Principal de Resultados -->
  <q-table
    :columns="columns"
    :rows="rows"
    :loading="loading"
    :pagination="{ rowsPerPage: 10 }"
    flat
    bordered
  >
    <!-- Columna Personalizada para Estatus -->
    <template v-slot:body-cell-is_active="props">
      <q-td class="text-center">
        <q-toggle
          v-model="props.row.is_active"
          :true-value="true"
          :false-value="false"
          color="primary"
          @update:model-value="toggleStatus(props.row)"
        />
      </q-td>
    </template>

    <!-- Columna Personalizada para Acciones -->
    <template v-slot:body-cell-actions="props">
      <q-td class="text-right">
        <q-btn
          icon="sym_o_edit"
          flat
          dense
          color="secondary"
          @click="openEdit(props.row)"
        />
      </q-td>
    </template>
  </q-table>

  <!-- Componentes Modales -->
  <DonorKardexModal
    ref="kardexModalRef"
    @saved="fetchDonors"
  />
  <ApplyDonationDialog ref="donationDialog" />
</template>

<style scoped>
.custom-link {
  text-decoration: none;
  transition: color 0.2s ease;
}
.custom-link:hover {
  text-decoration: underline;
  color: var(--q-primary-dark) !important;
}
.no-underline {
  text-decoration: none;
}
.custom-link {
  text-decoration: none !important;
  background-image: linear-sheet(to right, currentColor, currentColor);
  background-position: 1.3em 100%;
  background-size: calc(100% - 1.3em) 1px;
  background-repeat: no-repeat;
}
</style>

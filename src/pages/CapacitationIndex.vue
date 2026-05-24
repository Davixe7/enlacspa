<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'
import { date } from 'quasar'
import CapacitationDialog from 'src/components/CapacitationDialog.vue'

const capacitations = ref([])
const loading = ref(false)
const capacitationDialogRef = ref(null)

// Configuración de ordenamiento automático por fecha de la más reciente a la más antigua
const paginationConfig = ref({
  sortBy: 'date',
  descending: true,
  page: 1,
  rowsPerPage: 15
})

// Columnas con la nueva columna de acciones al final
const columns = [
  {
    name: 'name',
    label: 'Nombre de la Capacitación',
    field: 'name',
    align: 'left',
    sortable: true
  },
  {
    name: 'date',
    label: 'Fecha',
    field: 'date',
    align: 'center',
    sortable: true
  },
  {
    name: 'start_time',
    label: 'Hora Inicial',
    field: 'start_time',
    align: 'center'
  },
  {
    name: 'end_time',
    label: 'Hora Final',
    field: 'end_time',
    align: 'center'
  },
  {
    name: 'location',
    label: 'Lugar',
    field: 'location',
    align: 'left',
    sortable: true
  },
  {
    name: 'internal_count',
    label: 'Invitados Internos',
    field: 'internal_count',
    align: 'center',
    sortable: true
  },
  {
    name: 'external_count',
    label: 'Invitados Externos',
    field: 'external_count',
    align: 'center',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]

// --- CARGA DE DATOS ---
async function fetchCapacitations() {
  try {
    loading.value = true
    const response = await api.get('/capacitations')
    capacitations.value = response.data.data || response.data || []
  } catch (e) {
    console.error('Error al consultar capacitaciones:', e)
    notify.negative('No se pudo cargar el listado de capacitaciones')
  } finally {
    loading.value = false
  }
}

// --- MANEJADORES DE UI ---
function openCapacitationDialog(capacitation = null) {
  if (capacitationDialogRef.value) {
    // Si viene una capacitación, se la pasamos al open() para editar
    capacitationDialogRef.value.open(capacitation)
  }
}

function formatDateString(dateVal) {
  if (!dateVal) return ''
  return date.formatDate(date.extractDate(dateVal, 'YYYY-MM-DD'), 'DD/MM/YYYY')
}

onMounted(() => {
  fetchCapacitations()
})
</script>

<template>
  <q-page class="q-pa-md">
    <!-- Encabezado del Módulo -->
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div>
          <h1 class="page-title q-mb-none">Control de Capacitaciones</h1>
        </div>
        <p class="text-caption text-grey-7 q-mb-none">
          Historial, registro y gestión de invitados para capacitaciones de ENLAC.
        </p>
      </div>

      <!-- Botón + Nuevo -->
      <q-btn
        color="primary"
        icon="add"
        label="Nueva Capacitación"
        unelevated
        @click="openCapacitationDialog()"
      />
    </div>

    <!-- Tabla Principal de Registros -->
    <q-card
      flat
      bordered
    >
      <q-table
        :rows="capacitations"
        :columns="columns"
        row-key="id"
        flat
        :loading="loading"
        :pagination="paginationConfig"
        no-data-label="No se encontraron capacitaciones registradas"
        loading-label="Cargando capacitaciones..."
      >
        <!-- Celda de Fecha -->
        <template v-slot:body-cell-date="props">
          <q-td :props="props">
            <q-chip
              outline
              square
              color="blue-grey"
              text-color="blue-grey"
              dense
            >
              <q-icon
                name="event"
                class="q-mr-xs"
              />
              {{ formatDateString(props.row.date) }}
            </q-chip>
          </q-td>
        </template>

        <!-- Celda de Hora Inicial -->
        <template v-slot:body-cell-start_time="props">
          <q-td :props="props">
            <q-chip
              flat
              color="grey-3"
              text-color="grey-9"
              dense
              class="text-weight-medium"
            >
              <q-icon
                name="play_arrow"
                color="green"
                class="q-mr-xs"
              />
              {{ props.row.start_time }}
            </q-chip>
          </q-td>
        </template>

        <!-- Celda de Hora Final -->
        <template v-slot:body-cell-end_time="props">
          <q-td :props="props">
            <q-chip
              flat
              color="grey-3"
              text-color="grey-9"
              dense
              class="text-weight-medium"
            >
              <q-icon
                name="stop"
                color="red"
                class="q-mr-xs"
              />
              {{ props.row.end_time }}
            </q-chip>
          </q-td>
        </template>

        <!-- Celda de Invitados Internos -->
        <template v-slot:body-cell-internal_count="props">
          <q-td
            :props="props"
            class="text-center"
          >
            <q-badge
              color="blue-2"
              text-color="blue-9"
              class="text-bold q-px-sm q-py-xs"
            >
              {{ props.row.internal_count }} internos
            </q-badge>
          </q-td>
        </template>

        <!-- Celda de Invitados Externos -->
        <template v-slot:body-cell-external_count="props">
          <q-td
            :props="props"
            class="text-center"
          >
            <q-badge
              color="orange-2"
              text-color="orange-9"
              class="text-bold q-px-sm q-py-xs"
            >
              {{ props.row.external_count }} externos
            </q-badge>
          </q-td>
        </template>

        <!-- Celda de Acciones (Editar) -->
        <template v-slot:body-cell-actions="props">
          <q-td
            :props="props"
            class="q-gutter-x-sm"
          >
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="edit"
              @click="openCapacitationDialog(props.row)"
            >
              <q-tooltip>Editar capacitación</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- Componente Modal del Formulario -->
    <capacitation-dialog
      ref="capacitationDialogRef"
      @refresh="fetchCapacitations"
      @saved="fetchCapacitations"
    />
  </q-page>
</template>

<style scoped>
.q-table__container {
  border-radius: 8px;
}
</style>

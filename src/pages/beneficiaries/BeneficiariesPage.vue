<script setup>
import { onMounted, ref } from 'vue'
import { api } from 'src/boot/axios'
import { formatDate } from 'src/utils/formatDate'
import { useAuthStore } from 'src/stores/user-store'
import { useQuasar } from 'quasar'

import BeneficiaryStatusChangeForm from 'components/BeneficiaryStatusChangeForm.vue'
import ProgramarIngresoDialog from './ProgramarIngresoDialog.vue'

const $q = useQuasar()
const authStore = useAuthStore()
const searchQuery = ref('')
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  rows.value = (await api.get('beneficiaries')).data.data
  loading.value = false
})

const statusDialog = ref(false)
const selectedRow = ref(null)

function openStatusDialog(row, newStatus) {
  selectedRow.value = row
  selectedRow.value.newStatus = newStatus
  statusDialog.value = true
}

const sortable = true

const rows = ref([])
const columns = ref([
  { name: 'name', label: 'Nombre del Beneficiario', field: 'name', align: 'left', sortable },
  { name: 'sheet', label: 'Folio', field: 'id', align: 'left', sortable },
  { name: 'status', label: 'Estatus', field: 'status', align: 'left', sortable },
  { name: 'entry_date', label: 'Fecha de ingreso', field: 'scheduled_entry_date', sortable },
  { name: 'program_name', label: 'Programa', field: 'program_name', align: 'left', sortable },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' }
])

const entryStatuses = [
  { value: 'pendiente_ingresar', label: 'Pendiente de ingresar' },
  { value: 'ingreso_programado', label: 'Ingreso programado' },
  { value: 'listo_ingresar', label: 'Listo para ingresar' },
  { value: 'activo', label: 'Activo' },
  { value: 'permiso_temporal', label: 'Permiso temporal' },
  { value: 'prueba_vida', label: 'Prueba de vida' },
  { value: 'inactivo', label: 'Inactivo' },
  { value: 'exenlac', label: 'Ex-ENLAC' },
  { value: 'graduado', label: 'Graduado' },
  { value: 'fallecido', label: 'Fallecido' }
]

const actions = ref([
  { disable: false, icon: 'visibility', route: 'perfil', label: 'Perfil' },
  { disable: false, icon: 'content_paste', route: 'evaluar', label: 'Evaluar' },
  { disable: !authStore.can('kardexes.update'), icon: 'folder', route: 'kardex', label: 'Kardex' },
  { disable: false, icon: 'calendar_month', route: 'citas', label: 'Citas' },
  { disable: false, icon: 'attach_money', route: 'cuotas', label: 'Control de Cuotas' },
  { disable: false, icon: 'list_alt_check', route: 'planes', label: 'Programacion Individual' }
])

const onProgramarIngreso = (row) => {
  $q.dialog({
    component: ProgramarIngresoDialog,
    componentProps: { row }
  }).onOk(async (payload) => {
    await api.post(`beneficiaries/${row.id}/status`, {
      status: 'programar_ingreso',
      comment: 'Programar ingreso',
      program_id: payload.programId,
      scheduled_entry_date: payload.entryDate,
      observations: payload.observations
    })

    row.status = 'ingreso_programado'
    row.scheduled_entry_date = formatDate(payload.entryDate)

    $q.notify({ type: 'positive', message: 'Ingreso programado correctamente' })
  })
}
</script>

<template>
  <div class="flex">
    <h1 class="page-title">Admisiones y Beneficiarios</h1>
    <div class="q-ml-auto flex">
      <q-input
        outlined
        v-model="searchQuery"
        debounce="500"
        clearable
      >
        <template v-slot:prepend> <q-icon name="search" /></template>
      </q-input>
    </div>
  </div>
  <q-table
    bordered
    flat
    hide-bottom
    :rows="rows"
    :columns="columns"
    :pagination="{ rowsPerPage: 0 }"
    :loading="loading"
    :filter="searchQuery"
  >
    <template v-slot:loading>
      <div class="flex q-my-lg justify-center">
        <div>
          <q-spinner
            size="30px"
            color="primary"
            class="q-mr-md"
          ></q-spinner>
          Cargando...
        </div>
      </div>
    </template>
    <template v-slot:body-cell-status="props">
      <q-td>
        <q-select
          dense
          outlined
          hide-bottom-space
          emit-value
          map-options
          :options="entryStatuses"
          :disable="props.row.status === 'fallecido'"
          :model-value="props.row.status"
          @update:model-value="(val) => openStatusDialog(props.row, val)"
        />
      </q-td>
    </template>

    <template v-slot:body-cell-actions="props">
      <q-td class="text-right q-py-xs">
        <div q-table__actions>
          <!-- Botón programar ingreso -->
          <q-btn
            round
            unelevated
            dense
            icon="sym_o_event"
            @click="onProgramarIngreso(props.row)"
          >
            <q-tooltip>Programar ingreso</q-tooltip>
          </q-btn>

          <q-btn
            v-for="action in actions"
            :key="action.icon"
            :disable="action.disable"
            round
            unelevated
            dense
            :icon="`sym_o_${action.icon}`"
            :to="`beneficiarios/${props.row.id}/${action.route}`"
            ><q-tooltip
              :offset="[0, 0]"
              anchor="top middle"
              self="bottom middle"
            >
              {{ action.label }}
            </q-tooltip>
          </q-btn>
        </div>
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="statusDialog">
    <BeneficiaryStatusChangeForm
      v-model="selectedRow"
      @close="statusDialog = false"
    />
  </q-dialog>
</template>

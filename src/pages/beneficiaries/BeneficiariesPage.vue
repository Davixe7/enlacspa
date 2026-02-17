<script setup>
import { onMounted, ref } from 'vue'
import { api } from 'src/boot/axios'
import { useAuthStore } from 'src/stores/user-store'
import { useQuasar } from 'quasar'

import BeneficiaryStatusChangeForm from 'components/BeneficiaryStatusChangeForm.vue'
import ProgramarIngresoDialog from './ProgramarIngresoDialog.vue'
import notify from 'src/utils/notify'

const $q = useQuasar()
const authStore = useAuthStore()
const searchQuery = ref('')
const loading = ref(false)
const entryStatuses = ref([])

async function fetchStatuses() {
  try {
    entryStatuses.value = (
      await api.get('candidate_statuses/?exclude=pendiente,rechazado')
    ).data.data
  } catch (error) {
    console.log(error)
  }
}

onMounted(async () => {
  loading.value = true
  await fetchStatuses()
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
  { name: 'status', label: 'Estado del beneficiario', align: 'left', sortable },
  { name: 'program_name', label: 'Programa', field: 'program_name', align: 'left', sortable },
  { name: 'entry_date', label: 'Fecha de ingreso', field: 'entry_date', sortable },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' }
])

const actions = ref([
  { disable: false, icon: 'visibility', route: 'perfil', label: 'Perfil' },
  { disable: false, icon: 'content_paste', route: 'evaluar', label: 'Evaluar' },
  { disable: !authStore.can('kardexes.update'), icon: 'folder', route: 'kardex', label: 'Kardex' },
  { disable: false, icon: 'calendar_month', route: 'citas', label: 'Citas' },
  { disable: false, icon: 'attach_money', route: 'cuotas', label: 'Control de Cuotas' },
  { disable: false, icon: 'list_alt_check', route: 'planes', label: 'Programacion Individual' }
])

const onScheduleEntry = (row) => {
  const normalized = {
    id: row.id,
    name: row.name,
    programId: row.program.id
  }

  $q.dialog({
    component: ProgramarIngresoDialog,
    componentProps: { entry: normalized }
  }).onOk(async (payload) => {
    console.log(payload)
    refreshBeneficiary(row)
    $q.notify({ type: 'positive', message: 'Ingreso programado correctamente' })
  })
}

async function refreshBeneficiary(row) {
  let newRow = (await api.get(`/beneficiaries/${row.id}`)).data.data
  rows.value.splice(rows.value.indexOf(row), 1, newRow)
}

function onStatusUpdated({ id, status }) {
  if ([7, 8, 9].includes(status)) {
    rows.value = rows.value.filter((row) => row.id !== id)
    notify.positive('Movido a la tabla de reportes.')
  }
}
</script>

<template>
  <div class="column q-my-sm">
    <h1 class="page-title">Admisiones y Beneficiarios</h1>

    <div class="row items-center q-my-sm">
      <div class="col-auto">
        <q-btn :loading="loading" color="primary" icon="description" outline to="/beneficiarios/reportes">
          Reporte de Bajas
        </q-btn>
      </div>

      <div class="col-auto q-ml-auto">
        <q-input outlined v-model="searchQuery" debounce="500" clearable style="width: 250px">
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>
  </div>
  <q-table row-key="id" bordered flat hide-bottom :rows="rows" :columns="columns" :pagination="{ rowsPerPage: 0 }"
    :loading="loading" :filter="searchQuery">
    <template v-slot:loading>
      <div class="flex q-my-lg justify-center">
        <div>
          <q-spinner size="30px" color="primary" class="q-mr-md"></q-spinner>
          Cargando...
        </div>
      </div>
    </template>
    <template v-slot:body-cell-status="props">
      <q-td>
        <q-select dense outlined hide-bottom-space emit-value map-options option-value="value" option-label="label"
          :options="entryStatuses" :model-value="props.row.status"
          @update:model-value="(val) => openStatusDialog(props.row, val)" />
      </q-td>
    </template>

    <template v-slot:body-cell-actions="props">
      <q-td class="text-right q-py-xs">
        <div q-table__actions>
          <q-btn :disable="props.row.status !== 'listo'" round unelevated dense icon="sym_o_event"
            @click="onScheduleEntry(props.row)">
            <q-tooltip>Programar ingreso</q-tooltip>
          </q-btn>

          <q-btn v-for="action in actions" :key="action.icon" :disable="action.disable" round unelevated dense
            :icon="`sym_o_${action.icon}`" :to="`beneficiarios/${props.row.id}/${action.route}`"><q-tooltip
              :offset="[0, 0]" anchor="top middle" self="bottom middle">
              {{ action.label }}
            </q-tooltip>
          </q-btn>
        </div>
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="statusDialog">
    <BeneficiaryStatusChangeForm v-model="selectedRow" @status-updated="onStatusUpdated"
      @close="statusDialog = false" />
  </q-dialog>
</template>

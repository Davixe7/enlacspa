<script setup>
import { computed, onMounted, ref } from 'vue'
import { api } from 'src/boot/axios'
import { useAuthStore } from 'src/stores/user-store'
import { useQuasar } from 'quasar'

import BeneficiaryStatusChangeForm from 'components/BeneficiaryStatusChangeForm.vue'
import ProgramarIngresoDialog from './ProgramarIngresoDialog.vue'
import notify from 'src/utils/notify'

const searchQuery = ref('')
const statusFilter = ref(null)
const results = computed(() => {
  if (statusFilter.value == null) {
    return [...rows.value]
  }
  return rows.value.filter((row) => row.status == statusFilter.value)
})
const statusesOptions = ref([{ value: null, label: 'Todos los estados' }])

const $q = useQuasar()
const authStore = useAuthStore()
const loading = ref(false)
const entryStatuses = ref([])
const entryStatusesMap = computed(
  () => new Map(entryStatuses.value.map((status) => [status.value, status.label]))
)

async function fetchStatuses() {
  try {
    let route = 'candidate_statuses/?exclude=pendiente,rechazado'
    entryStatuses.value = (await api.get(route)).data.data
    statusesOptions.value = [{ value: null, label: 'Todos los estados' }, ...entryStatuses.value]
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

function openStatusDialog(row) {
  selectedRow.value = row
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
  { disable: false, icon: 'list_alt_check', route: 'planes', label: 'Programacion Individual' },
  { disable: false, icon: 'content_paste', route: 'entrevistar', label: 'Entrevistar' }
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
      <div class="col-auto q-gutter-x-md">
        <q-btn
          :loading="loading"
          color="primary"
          icon="description"
          outline
          to="/beneficiarios/reportes"
          label="Reporte de Bajas"
        />

        <q-btn
          :loading="loading"
          color="primary"
          icon="history"
          outline
          :to="{ name: 'logs' }"
          label="Reportes de cambio de Estado"
        />
      </div>

      <div class="col-auto q-ml-auto flex items-start">
        <q-input
          outlined
          v-model="searchQuery"
          debounce="500"
          clearable
          style="width: 250px"
          class="q-mr-md"
          hide-bottom-space
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-select
          outlined
          hide-bottom-space
          :options="statusesOptions"
          v-model="statusFilter"
          stack-label
          dense
          style="width: 250px"
          emit-value
          map-options
        />
      </div>
    </div>
  </div>
  <q-table
    row-key="id"
    bordered
    flat
    hide-bottom
    :rows="results"
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
          />
          Cargando...
        </div>
      </div>
    </template>
    <template v-slot:body-cell-status="props">
      <q-td>
        <div
          @click="openStatusDialog(props.row)"
          style="border: 1px solid rgba(0, 0, 0, 0.25); border-radius: 3px; padding: 8px 12px"
        >
          {{ entryStatusesMap.get(props.row.status) }}
        </div>
      </q-td>
    </template>

    <template v-slot:body-cell-name="props">
      <q-td>
        <router-link :to="{ name: 'beneficiary.reports', params: { candidateId: props.row.id } }">{{
          props.row.name
        }}</router-link>
      </q-td>
    </template>

    <template v-slot:body-cell-actions="props">
      <q-td class="text-right q-py-xs">
        <div q-table__actions>
          <q-btn
            :disable="props.row.status !== 'listo'"
            round
            unelevated
            dense
            icon="sym_o_event"
            @click="onScheduleEntry(props.row)"
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
      @status-updated="onStatusUpdated"
      @close="statusDialog = false"
    />
  </q-dialog>
</template>

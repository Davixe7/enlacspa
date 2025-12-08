<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import ProgramarIngresoDialog from './ProgramarIngresoDialog.vue'

onMounted(() => fetchBeneficiaries())

async function fetchBeneficiaries() {
  errors.value = {}
  let params = { ...query.value }

  loading.value = true
  let response = (await api.get('beneficiaries/reports', { params })).data
  beneficiaries.value = response.data.beneficiaries
  counts.value = response.data.counts
  loading.value = false
}

const $q = useQuasar()
const errors = ref({})
const loading = ref(false)
const rows = ref([{}])
const query = ref({})
const beneficiaries = ref([])
const counts = ref({})

const beneficiaryColumns = ref([
  { name: 'id', label: 'Folio', field: 'id', sortable: true },
  { name: 'name', label: 'Nombre del Beneficiario', field: 'name', sortable: true },
  { name: 'status', label: 'Estado', field: (row) => row.status.label, sortable: true },
  { name: 'reingresar', label: 'Programar Reingreso', field: 'reingresar' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'right' }
])

const actions = ref([{ disable: false, icon: 'visibility', route: 'perfil', label: 'Perfil' }])

const columns = ref([
  { align: 'center', label: 'Beneficiarios Graduados' },
  { align: 'center', label: 'Beneficiarios Fallecidos' },
  { align: 'center', label: 'Beneficiarios Ex-ENLAC' }
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
    row.enrollment_status_id = 5
    row.entry_date = payload.entryDate
    row.program.id = payload.programId

    // restar 1 al contador del estado anterior si aplica
    if (counts.value[row.candidate_status_id]) {
      counts.value[row.candidate_status_id] = Math.max(0, counts.value[row.candidate_status_id] - 1)
    }

    // eliminar el beneficiario de la tabla
    beneficiaries.value = beneficiaries.value.filter((b) => b.id !== row.id)
    $q.notify({ type: 'positive', message: 'Ingreso programado correctamente' })
  })
}
</script>

<template>
  <q-page>
    <div class="row items-center">
      <div class="col q-my-xs">
        <h1 class="page-title">Reporte de Beneficiarios Dados de Baja</h1>
      </div>
      <div class="col-auto row items-center q-gutter-sm">
        <q-input
          outlined
          stack-label
          label="Nombre"
          v-model="query.name"
          :error="!!errors.name"
          :error-message="errors.name"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-btn
          class="q-mt-md"
          :loading="loading"
          color="primary"
          @click="fetchBeneficiaries"
        >
          Buscar
        </q-btn>
      </div>
    </div>

    <div class="page-title q-mb-lg">Información general</div>

    <q-table
      flat
      bordered
      class="q-mb-xl q-table-custom"
      :rows="rows"
      :columns="columns"
      hide-bottom
    >
      <template v-slot:body="">
        <q-tr>
          <q-td class="number">{{ counts[7] ?? 0 }}</q-td>
          <q-td class="number">{{ counts[8] ?? 0 }}</q-td>
          <q-td class="number">{{ counts[9] ?? 0 }}</q-td>
        </q-tr>
      </template>
    </q-table>

    <div class="page-title q-my-lg">Información en detalle</div>

    <q-table
      class="q-table-custom-left"
      flat
      bordered
      wrap-cells
      :columns="beneficiaryColumns"
      :rows="beneficiaries"
      row-key="id"
    >
      <template v-slot:body-cell-reingresar="props">
        <q-td class="text-left q-py-xs">
          <q-btn
            v-if="props.row.status.name !== 'fallecido'"
            unelevated
            label="Reingresar"
            color="primary"
            dense
            @click="onScheduleEntry(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td class="text-right q-py-xs">
          <div q-table__actions>
            <q-btn
              v-for="action in actions"
              :key="action.icon"
              :disable="action.disable"
              round
              unelevated
              dense
              :icon="action.icon"
              :to="`${props.row.id}/${action.route}`"
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
  </q-page>
</template>

<style lang="scss">
.q-table th {
  font-size: 16px;
  font-weight: 700;
  color: #374151;
  vertical-align: top;
  padding: 16px;
  white-space: break-spaces;
}

.q-table thead {
  background: #e5e7eb;
}

.q-table th:last-child {
  text-align: right;
}

.q-table-custom th:last-child {
  text-align: center;
}

.q-table-custom-left th:last-child {
  text-align: left;
}
.q-table tr td,
.q-table tr th {
  text-align: left !important;
}

.number {
  color: $primary;
  font-size: 25px !important;
  font-weight: 600;
  text-align: center;
}

.label-alt-2 {
  color: #111827;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
}

.q-field__prepend + .q-field__control-container .q-field__label {
  margin-left: -2.25rem;
}

h1.page-title {
  margin-bottom: 0.25rem;
  font-size: 35px;
}
</style>

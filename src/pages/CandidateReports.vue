<script setup>
import { api } from 'src/boot/axios';
import { onMounted, ref } from 'vue';

onMounted(() => fetchCandidates())

async function fetchCandidates() {
  errors.value = {}
  let params = { ...query.value }
  let fields = ['name', 'birth_date', 'date_from', 'date_to']

  fields.forEach(key => {
    if (!query[key]) { delete query[key] }
  })

  if (params.date_from && !params.date_to) {
    errors.value = { date_to: 'Debes seleccionar una fecha de fin' }
    return
  }

  if (params.date_to && !params.date_from) {
    errors.value = { date_from: 'Debes seleccionar una fecha de inicio' }
    return
  }

  loading.value = true
  let response = (await api.get('candidates', { params })).data
  candidates.value = response.data
  counts.value = response.counts
  loading.value = false
}

const errors = ref({})
const loading = ref(false)
const rows = ref([{}])
const query = ref({})
const candidates = ref([])
const counts = ref({})
const candidateColumns = ref([
  {
    name: "name",
    label: "Nombre de Candidato",
    align: "left",
    field: "full_name",
    sortable: true,
  },
  {
    name: "sheet",
    label: "Folio",
    align: "left",
    field: "sheet",
    sortable: true,
  },
  {
    name: "date",
    label: "Fecha de Evaluación",
    align: "left",
    field: (row) => row.evaluation_schedule ? row.evaluation_schedule.date : 'NO DISPONIBLE',
    sortable: true,
  },
  {
    name: "evaluator",
    label: "Evaluador",
    align: "left",
    field: (row) => row.evaluation_schedule ? row.evaluation_schedule.evaluator.name : 'No disponible',
    sortable: true,
  },
  {
    name: "is_candidate",
    label: "Candidato",
    align: "left",
    field: (row) => {
      if (row.acceptance_status === 1) { return 'Si' }
      if (row.acceptance_status === 0) { return 'No' }
      if (row.acceptance_status === null) { return 'Pendiente' }
    },
    sortable: true,
  },
  {
    name: "notes",
    label: "Observaciones",
    align: "right",
    field: (row) => row.acceptance_status == 0 ? row.rejection_comment : (row.program ? row.program.name : 'Pendiente'),
    sortable: true,
  },
]);

const columns = ref([
  { align: 'center', label: 'Candidatos en proceso' },
  { align: 'center', label: 'No fueron aceptados' },
  { align: 'center', label: 'Si fueron aceptados pero no han ingresado' },
  { align: 'center', label: 'Nuevos ingresos' },
  { align: 'center', label: 'Candidatos en total' }
])
</script>

<template>
  <q-page>
    <h1 class="page-title q-mb-lg">Reporte de candidatos</h1>

    <div class="row q-col-gutter-lg items-end q-mb-xl">
      <div class="col-12 col-md-auto">
        <div class="label-alt-2">
          Fecha a consultar
        </div>
        <q-input
          outlined
          stack-label
          label="Desde"
          type="date"
          v-model="query.date_from"
          :error="!!errors.date_from"
          :error-message="errors.date_from"
        >
          <template v-slot:prepend>
            <q-icon name="calendar_today"></q-icon>
          </template></q-input>
      </div>
      <div class="col-12 col-md-auto">
        <q-input
          outlined
          stack-label
          label="Hasta"
          type="date"
          v-model="query.date_to"
          :error="!!errors.date_to"
          :error-message="errors.date_to"
        >
        </q-input>
      </div>
      <div class="col-12 col-md-auto">
        <div class="label-alt-2">
          Buscar por
        </div>
        <q-input
          outlined
          stack-label
          label="Nombre"
          v-model="query.name"
          :error="!!errors.name"
          :error-message="errors.name"
        >
          <template v-slot:prepend>
            <q-icon name="search"></q-icon>
          </template></q-input>
      </div>
      <div class="col-12 col-md-auto">
        <q-input
          outlined
          stack-label
          label="Fecha de nacimiento"
          v-model="query.birth_date"
          type="date"
          :error="!!errors.birth_date"
          :error-message="errors.birth_date"
        >
          <template v-slot:prepend>
            <q-icon name="calendar_today"></q-icon>
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-auto">
        <q-btn
          :loading="loading"
          color="primary"
          style="margin-bottom: 20px"
          @click="fetchCandidates"
        >Buscar</q-btn>
      </div>
    </div>

    <div class="page-title q-mb-lg">
      Información general
    </div>

    <q-table
      flat
      bordered
      class="q-mb-xl"
      :rows="rows"
      :columns="columns"
      hide-bottom
    >
      <template v-slot:body="">
        <q-tr>
          <q-td class="number">{{ counts.en_proceso }}</q-td>
          <q-td class="number">{{ counts.rechazados }}</q-td>
          <q-td class="number">{{ counts.aceptados_no_ingresados }}</q-td>
          <q-td class="number">{{ counts.aceptados_ingresados }}</q-td>
          <q-td class="number">{{ counts.total }}</q-td>
        </q-tr>
      </template>
    </q-table>

    <div class="page-title q-my-lg">
      Información en detalle
    </div>

    <q-table
      flat
      bordered
      wrap-cells
      :columns="candidateColumns"
      :rows="candidates"
    >
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

.q-field__prepend+.q-field__control-container .q-field__label {
  margin-left: -2.25rem;
}
</style>

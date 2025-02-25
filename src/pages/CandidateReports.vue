<script setup>
import { api } from 'src/boot/axios';
import { onMounted, ref } from 'vue';

onMounted(() => fetchCandidates())

async function fetchCandidates() {
  candidates.value = (await api.get('candidates')).data.data
}

const rows = ref([{}])
const query = ref({})
const candidates = ref([])
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
    field: (row) => (row.is_candidate ? "Sí" : "No"),
    sortable: true,
  },
  {
    name: "notes",
    label: "Observaciones",
    align: "left",
    field: () => "Lörem ipsum orade kövis då antivaxxare.",
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
    <h1 class="page-title q-pb-lg">Reporte de candidatos</h1>

    <div class="row q-col-gutter-lg items-end q-mb-xl">
      <div class="col-12 col-md-auto">
        <div class="label-alt-2">
          Fecha a consultar
        </div>
        <q-input
          outlined
          stack-label
          label="Desde"
          v-model="query.date_from"
          mask="##/##/####"
          icon-prepend="calendar_today"
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
          v-model="query.date_to"
          mask="##/##/####"
          icon-prepend="calendar_today"
        >
          <template v-slot:prepend>
            <q-icon name="calendar_today"></q-icon>
          </template></q-input>
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
          mask="##/##/####"
        >
          <template v-slot:prepend>
            <q-icon name="search"></q-icon>
          </template></q-input>
      </div>
      <div class="col-12 col-md-auto">
        <q-input
          outlined
          stack-label
          label="Hasta"
          v-model="query.date_to"
          mask="##/##/####"
          icon-prepend="calendar_today"
        >
          <template v-slot:prepend>
            <q-icon name="calendar_today"></q-icon>
          </template>
        </q-input>
      </div>
      <div class="col-12 col-md-auto">
        <q-btn color="primary">Buscar</q-btn>
      </div>
    </div>

    <div class="page-title q-mb-lg">
      Información general
    </div>

    <q-table
      class="q-mb-lg"
      :rows="rows"
      :columns="columns"
      hide-bottom
    >
      <template v-slot:body="">
        <q-tr>
          <q-td class="number">10</q-td>
          <q-td class="number">10</q-td>
          <q-td class="number">05</q-td>
          <q-td class="number">75</q-td>
          <q-td class="number">100</q-td>
        </q-tr>
      </template>
    </q-table>

    <div class="page-title q-my-lg">
      Información en detalle
    </div>

    <q-table
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

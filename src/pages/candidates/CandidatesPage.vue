<script setup>
import { api } from 'src/boot/axios'
import { onMounted } from 'vue'
import { ref } from 'vue'
import AppointmentForm from 'components/AppointmentForm.vue'
import CandidateReviewForm from 'components/CandidateReviewForm.vue'
import { formatDate } from 'src/utils/formatDate'

onMounted(() => fetchCandidates())

async function fetchCandidates() {
  rows.value = (await api.get('candidates')).data.data
}

const search = ref('')

const appointmentDialog = ref(false)
const rows = ref([])
const columns = ref([
  {
    name: 'name',
    label: 'Nombre de Candidato',
    align: 'left',
    field: 'full_name',
    sortable: true
  },
  {
    name: 'sheet',
    label: 'Folio',
    align: 'left',
    field: 'sheet',
    sortable: true
  },
  {
    name: 'date',
    label: 'Fecha de Evaluación',
    align: 'left',
    field: (row) => formatDate(row.evaluation_schedule.date),
    sortable: true
  },
  {
    name: 'evaluator',
    label: 'Evaluador',
    align: 'left',
    field: (row) => row.evaluation_schedule.evaluator?.name,
    sortable: true
  },
  {
    name: 'notes',
    label: 'Observaciones',
    align: 'left',
    field: 'diagnosis',
    sortable: false
  },
  {
    name: 'actions',
    label: 'Acciones',
    align: 'right',
    sortable: false
  }
])

const candidate = ref(null)
const reviewDialog = ref(false)

function editReview(row) {
  candidate.value = row
  reviewDialog.value = true
}
</script>

<template>
  <q-page>
    <q-dialog v-model="reviewDialog">
      <CandidateReviewForm
        :candidate="candidate"
        @saved="
          (r) => {
            candidate.review = r
            reviewDialog = false
          }
        "
        @close="reviewDialog = false"
      />
    </q-dialog>
    <h1 class="page-title">Candidatos y Evaluaciones</h1>

    <div class="flex q-mb-lg">
      <q-btn
        color="primary"
        icon="description"
        outline=""
        class="q-mr-md"
        to="/candidatos/reportes"
        label="Reporte de candidatos"
      />

      <q-btn
        color="primary"
        icon="calendar_today"
        outline=""
        @click="appointmentDialog = true"
        label="Programar cita"
      />

      <q-input
        class="q-ml-auto q-mr-md"
        v-model="search"
        :debounce="500"
        placeholder="Buscar"
        hide-bottom-space
        outlined
        clearable
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>

      <q-btn
        color="primary"
        icon="add"
        unelevated=""
        to="/candidatos/registrar"
        label="Nuevo Candidato"
      />
    </div>

    <q-table
      bordered
      flat
      wrap-cells
      hide-bottom
      :columns="columns"
      :rows="rows"
      :pagination="{ rowsPerPage: 0 }"
      :filter="search"
    >
      <template v-slot:body-cell-actions="props">
        <q-td>
          <div class="q-table__actions">
            <q-btn
              dense
              flat
              round
              icon="sym_o_edit"
              :to="`candidatos/${props.row.id}/editar`"
            />
            <q-btn
              dense
              flat
              round
              icon="sym_o_chat"
              :to="`candidatos/${props.row.id}/entrevistar`"
              class="q-mx-xs"
            />
            <q-btn
              dense
              flat
              round
              icon="sym_o_content_paste"
              :to="`candidatos/${props.row.id}/evaluar`"
            />
            <q-btn
              dense
              flat
              round
              icon="sym_o_note_alt"
              @click="editReview(props.row)"
            />
          </div>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="appointmentDialog">
      <AppointmentForm
        :candidates="rows"
        @close="appointmentDialog = false"
      ></AppointmentForm>
    </q-dialog>
  </q-page>
</template>

<style lang="scss">
.q-table td {
  vertical-align: top;
  padding: 16px;
}

td:nth-child(6) {
  max-width: 221px;
}

th:nth-child(1) {
  padding-right: 10%;
}

th:nth-child(3) {
  max-width: 125px;
}
</style>

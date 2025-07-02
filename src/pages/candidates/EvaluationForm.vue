<script setup>
import { api } from 'src/boot/axios'
import { computed, onMounted, ref } from 'vue'
import { useCandidateStore } from 'src/stores/candidate-store'
import CandidateProfile from 'src/components/CandidateProfile.vue'
import EvaluationResults from 'src/components/EvaluationResults.vue'
import EvaluationComments from 'src/components/EvaluationComments.vue'
import RankForm from 'src/components/RankForm.vue'
import AdmissionForm from 'src/components/AdmissionForm.vue'

const store = useCandidateStore()
const props = defineProps(['candidateId'])
const brainFunctions = ref([])
const evaluationFields = ref([])

const rank = ref({})
const columns = ref([])
const rows = ref([])

const dialog = ref(false)
const dialog2 = ref(false)

onMounted(async () => {
  store.id = props.candidateId
  await store.fetchCandidate()
  evaluationFields.value = (await api.get('evaluation_fields', { params: { candidate_id: props.candidateId } })).data.data
  brainFunctions.value = (await api.get('brain_functions')).data.data
  setColumns()
})

function setColumns() {
  let cols = [
    {
      name: 'name',
      label: 'Nivel Cerebral',
      align: 'left',
      sortable: false
    },
    {
      name: 'growth',
      label: 'Tiempo de Formación',
      align: 'left',
      sortable: false
    }
  ]
  brainFunctions.value.forEach((func) => {
    cols.push({
      name: func.id,
      label: func.name,
      field: (row) => row.ranks[func.id],
      align: 'left',
      sortable: false
    })
  })
  columns.value = [...cols]
  rows.value = Object.values(evaluationFields.value)
}

const allRanks = computed(() => {
  var newRanks = []
  evaluationFields.value.map((level) => {
    if (level.P > store.chronological_age) return
    newRanks = newRanks.concat(Object.values(level.ranks))
  })
  return newRanks
})

function updateRank(updatedRank) {
  let level = rows.value.find((field) => field.id == updatedRank.brain_level_id)
  let levelIndex = rows.value.indexOf(level)
  let newLevel = { ...rows.value[levelIndex] }
  newLevel.ranks[updatedRank.brain_function_id] = updatedRank

  rows.value.splice(levelIndex, 1, newLevel)
  dialog.value = false
}

function editRank(param) {
  rank.value = param
  dialog.value = true
}

function print() {
  window.print()
}
</script>

<template>
  <q-page>
    <div class="flex justify-between items-center q-mb-xl">
      <h1
        class="page-title"
        style="margin-bottom: 0"
      >
        Evaluación
      </h1>
      <q-btn
        @click="print"
        flat
        style="color: grey"
        >Exportar a PDF</q-btn
      >
    </div>

    <CandidateProfile
      :candidateId="candidateId"
      type="evaluation"
    >
    </CandidateProfile>

    <q-table
      flat
      bordered
      :rows="rows"
      :columns="columns"
      :pagination="{ rowsPerPage: -1 }"
      class="q-mb-xl"
      wrap-cells
      hide-bottom
    >
      <template v-slot:body-cell="props">
        <q-td
          :props="props"
          :style="{ backgroundColor: props.col.name == 'name' ? props.row.color : '' }"
        >
          <template v-if="props.col.name == 'name'">
            <div class="text-weight-bold">
              {{ props.row.grade }}
            </div>
            {{ props.row.name }}
          </template>
          <template v-else-if="props.col.name == 'growth'">
            <ul class="spl-list">
              <li>S = {{ props.row.S }} meses</li>
              <li>P = {{ props.row.P }} meses</li>
              <li>L = {{ props.row.L }} meses</li>
            </ul>
          </template>
          <template v-else>
            <q-btn
              v-if="props.row.P <= store.chronological_age"
              flat
              round
              :label="props.value.caracteristic ? props.value.caracteristic : ''"
              @click="editRank(props.value)"
            >
              <q-icon
                v-if="!props.value.caracteristic"
                name="edit"
              ></q-icon>
            </q-btn>
            <q-btn
              v-else
              flat
              round
              @click="editRank(props.value)"
              label="N/A"
            ></q-btn>
          </template>
        </q-td>
      </template>
    </q-table>

    <EvaluationResults
      v-if="allRanks.length && evaluationFields"
      :ranks="allRanks"
      :evaluationFields="evaluationFields"
    >
    </EvaluationResults>

    <EvaluationComments
      :rows="rows"
      :brainFunctions="brainFunctions"
    >
    </EvaluationComments>

    <q-dialog v-model="dialog">
      <RankForm
        :rank="rank"
        @rank-updated="updateRank"
        @close="dialog = false"
      ></RankForm>
    </q-dialog>

    <q-dialog v-model="dialog2">
      <AdmissionForm
        :candidateId="candidateId"
        @close="dialog2 = false"
      ></AdmissionForm>
    </q-dialog>

    <div class="flex justify-end">
      <q-btn
        color="primary"
        @click="dialog2 = true"
      >
        Guardar
      </q-btn>
    </div>
  </q-page>
</template>

<style scoped>
label {
  font-weight: 700;
  font-size: 16px;
  color: #111827;
  margin-right: 0.5rem;
  display: block;
  transform: none;
}

.spl-list {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

.q-table td,
.q-table th {
  width: 90px;
}

.q-table td:first-child {
  padding: 24px 33px !important;
  max-width: 177px;
}

.q-table th:nth-child(1) {
  padding: 24px 33px !important;
  max-width: 177px;
}
</style>

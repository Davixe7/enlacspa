<script setup>
import { api } from 'src/boot/axios';
import { computed, onMounted, ref } from 'vue';
import RankForm from './../components/RankForm.vue'
import CandidateProfile from './../components/CandidateProfile.vue'
import AdmissionForm from './../components/AdmissionForm.vue'

const props = defineProps(['candidateId'])
const brainFunctions = ref([])
const evaluationFields = ref([])

const rank = ref({})
const columns = ref([])
const rows = ref([])

const dialog = ref(false)
const dialog2 = ref(false)

onMounted(async () => {
  evaluationFields.value = (await (api.get('evaluation_fields', { params: { candidate_id: props.candidateId } }))).data.data
  brainFunctions.value = (await (api.get('brain_functions'))).data.data
  setColumns()
})

const commentsByFunction = computed(() => {
  let comments = {}
  rows.value.forEach(row => {
    brainFunctions.value.forEach(brainFunc => {
      if (row.ranks[brainFunc.id].comments) {
        comments[brainFunc.id] = comments[brainFunc.id]
          ? comments[brainFunc.id] + ',' + row.ranks[brainFunc.id].comments
          : row.ranks[brainFunc.id].comments
      }
    })
  })
  return comments
})

function setColumns() {
  let cols = [{
    name: 'name',
    label: 'Nivel Cerebral',
    align: 'left',
    sortable: false
  },
  {
    name: 'growth',
    label: 'Tiempo de Formacion',
    align: 'left',
    sortable: false
  }]
  brainFunctions.value.forEach(func => {
    cols.push({
      name: func.id,
      label: func.name,
      field: row => row.ranks[func.id],
      align: 'left',
      sortable: false
    })
  })
  columns.value = [...cols]
  rows.value = Object.values(evaluationFields.value)
}

function updateRank(updatedRank) {
  let level = rows.value.find(field => field.id == updatedRank.brain_level_id)
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
</script>

<template>
  <q-page>
    <h1 class="page-title">Evaluación</h1>

    <CandidateProfile :candidateId="candidateId">
    </CandidateProfile>

    <q-table
      :rows="rows"
      :columns="columns"
      :pagination="{ rowsPerPage: -1 }"
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
              @click="editRank(props.value)"
              flat
              round
            >
              {{ props.value.brain_function_id }}
            </q-btn>
          </template>
        </q-td>
      </template>
    </q-table>

    <div class="page-title">Comentarios de la evaluacion</div>
    <div class="q-gutter-y-xl">
      <q-input
        v-for="brainFunctionId in Object.keys(commentsByFunction)"
        :key="brainFunctionId"
        type="textarea"
        :label="brainFunctions.find(func => func.id == brainFunctionId).name"
        stack-label
        outlined
        v-model="commentsByFunction[brainFunctionId]"
        class="q-mb-lg"
      ></q-input>
    </div>

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
  margin-right: .5rem;
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

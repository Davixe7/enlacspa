<script setup>
import { api } from 'src/boot/axios';
import { computed, onMounted, ref } from 'vue';
import { useCandidateStore } from 'src/stores/candidate-store';
import RankForm from './../components/RankForm.vue'
import CandidateProfile from './../components/CandidateProfile.vue'
import AdmissionForm from './../components/AdmissionForm.vue'

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
    label: 'Tiempo de Formación',
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

const neurologicalAge = computed(() => {
  return allRanks.value.reduce((age, rank) => {
    if (!['F', 'P'].includes(rank.caracteristic)) return age
    return age + 1
  }, 0)
})

const developmentRate = computed(() => ((neurologicalAge.value / store.chronological_age) * 100).toFixed(2))

const allRanks = computed(() => {
  var newRanks = []
  evaluationFields.value.map(level => {
    if (level.P > store.chronological_age) return
    newRanks = newRanks.concat(Object.values(level.ranks))
  })
  return newRanks;
})

const damageExtension = computed(() => {
  let brainFunctions = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false }
  allRanks.value.map(rank => {
    if (!['F', '0'].includes(rank.caracteristic)) return
    brainFunctions[rank.brain_function_id] = true
  })
  let count = Object.values(brainFunctions).filter(val => val).length;
  return ({
    0: 'No hay daño',
    1: 'Focal',
    2: 'Relativamente Focal',
    3: 'Semifocal',
    4: 'Semidifusa',
    5: 'Relativamente Difusa',
    6: 'Difusa',
  })[count]
})

const damageGrade = computed(() => {
  let damageGrades = {
    "Completa": [0],
    "Profunda": [0.0001, 25],
    "Severa": [25.0001, 50],
    "Moderada": [50.0001, 75],
    "Leve": [75.0001, 99]
  }

  if (developmentRate.value <= 0) {
    return 'Completa';
  }

  if (developmentRate.value > 99) {
    return 'Leve';
  }

  for (const clave in damageGrades) {
    const rango = damageGrades[clave];
    if (rango.length === 1 && developmentRate.value === rango[0]) {
      return clave;
    }
    else if (rango.length === 2 && developmentRate.value >= rango[0] && developmentRate.value <= rango[1]) {
      return clave;
    }
  }
  return null;
});

const damageLaterality = computed(() => {
  var lateralities = { "l": false, "r": false }
  allRanks.value.map(rank => {
    if (!['F', '0'].includes(rank.caracteristic)) return
    lateralities[rank.laterality_impact] = true
  })
  return Object.values(lateralities).filter(val => val).length > 1 ? 'Bilateral' : 'Unilateral';
})

const damageLevel = computed(() => {
  let damageLog = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false }
  allRanks.value.map(rank => rank.caracteristic != 'P' ? damageLog[rank.brain_level_id] = true : '')
  let damagedLevelIds = Object.keys(damageLog).filter(key => damageLog[key])
  return evaluationFields.value.filter(level => damagedLevelIds.includes(String(level.id)))
})

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

function print() {
  window.print()
}
</script>

<template>
  <q-page>
    <div class="flex justify-between items-center q-mb-xl">
      <h1
        class="page-title"
        style="margin-bottom: 0;"
      >Evaluación</h1>
      <q-btn
        @click="print"
        flat
        style="color: grey;"
      >Exportar a PDF</q-btn>
    </div>

    <CandidateProfile
      :candidateId="candidateId"
      type="evaluation"
    >
    </CandidateProfile>

    <q-table
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

    <template v-if="!store.loading">
      <div class="page-title">Diagnostico Funcional</div>
      <div class="row q-col-gutter-xl q-mb-xl">
        <div class="col-12 col-md-3">
          <q-input
            outlined
            stack-label
            label="Edad cronológica (meses)"
            :modelValue="store ? store.chronological_age.split('.')[0] + ' meses' : ''"
          ></q-input>
        </div>

        <div class="col-12 col-md-3">
          <q-input
            outlined
            stack-label
            label="Edad neurológica (meses)(*)"
            :modelValue="neurologicalAge + ' meses'"
          ></q-input>
        </div>

        <div class="col-12 col-md-3">
          <q-input
            outlined
            stack-label
            label="Extension de la lesion(*)"
            :modelValue="damageExtension"
          ></q-input>
        </div>

        <div class="col-12 col-md-3">
          <q-input
            outlined
            stack-label
            label="Grado de la lesion(*)"
            :modelValue="damageGrade"
          ></q-input>
        </div>

        <div class="col-12 col-md-3">
          <q-input
            outlined
            stack-label
            label="Tasa de desarrollo (por formula)(*)"
            :value="developmentRate"
          ></q-input>
        </div>

        <div class="col-12 col-md-3">
          <q-input
            outlined
            stack-label
            label="Tasa de desarrollo (por conteo)(*)"
            :modelValue="developmentRate + '%'"
          ></q-input>
        </div>
      </div>

      <div class="row q-col-gutter-xl q-mb-xl">
        <div class="col-12 col-md-3">
          <q-input
            outlined
            stack-label
            label="Lateralidad"
            :modelValue="damageLaterality"
          ></q-input>
        </div>
        <div class="col-12 col-md-3">
          <label
            for="#"
            style="font-weight: 400; font-size: 14px; margin-bottom: .5rem;"
          >Nivel de la lesion</label>
          <ul style="margin: 0; padding: 0 0 0 1rem;">
            <li
              v-for="item in damageLevel"
              :key="item.id"
            >
              {{ item.name }}
            </li>
          </ul>
        </div>
      </div>

      <div class="page-title">Comentarios de la evaluación</div>
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
    </template>

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

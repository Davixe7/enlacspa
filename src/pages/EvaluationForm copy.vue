<script setup>
import { api } from 'src/boot/axios';
import { onMounted, ref } from 'vue';
const props = defineProps(['candidateId'])
const candidate = ref({})
const brainLevels = ref([])
const brainFunctions = ref([])
const ranks = ref({ "1": {}, "2": {}, "3": {}, "4": {} })
const rank = ref({})
const columns = ref([])
const rows = ref([])

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
      name: 'func.name',
      label: func.name,
      field: row => row.functions[func.id],
      align: 'left',
      sortable: false
    })
  })
  columns.value = [...cols]
  rows.value = Object.values(ranks.value)
}

function populateRanks() {
  brainLevels.value.forEach(brainLevel => {
    if (!ranks.value[brainLevel.id]) {
      ranks.value[brainLevel.id] = { functions: {} }
    }

    ranks.value[brainLevel.id] = { ...ranks.value[brainLevel.id], brainLevel }

    brainFunctions.value.forEach(brainFunction => {
      if (!ranks.value[brainLevel.id]['functions'][brainFunction.id]) {
        ranks.value[brainLevel.id]['functions'][brainFunction.id] = {
          brain_level_id: brainLevel.id,
          brain_function_id: brainFunction.id,
          candidate_id: candidate.value.id,
          caracteristics: null,
          comments: null,
          laterality_impact: null,
        }
      }
    })
  })
}

const dialog = ref(false)

onMounted(async () => {
  candidate.value = (await (api.get(`candidates/${props.candidateId}`))).data.data
  brainLevels.value = (await (api.get('brain_levels'))).data.data
  brainFunctions.value = (await (api.get('brain_functions'))).data.data
  ranks.value = candidate.value.brain_function_ranks
  populateRanks()
  setColumns()
})

function editRank(param) {
  rank.value = param
  dialog.value = true
}
</script>

<template>
  <q-page>
    <h1 class="page-title">Evaluación</h1>

    <div
      class="flex"
      style="margin-bottom: 65px;"
    >
      <q-img
        width="174px"
        height="169px"
        color="grey"
        class="bg-grey-4"
        style="margin-right: 20px;"
        :src="candidate.picture"
      ></q-img>

      <div class="flex column justify-between q-px-md">
        <div>
          <label for="">Nombre:</label>
          {{ candidate.full_name }}
        </div>
        <div>
          <label for="">Fecha:</label>
          {{ candidate.created_at }}
        </div>
        <div>
          <label for="">Folio:</label>
          {{ candidate.sheet }}
        </div>
      </div>

      <div class="flex column justify-between q-px-md">
        <div>
          <label for="">Edad cronologica</label>
          {{ candidate.chronological_age }}
        </div>
        <div>
          <label for="">Fecha</label>
          {{ candidate.created_at }}
        </div>
        <div>
          <label for="">Folio</label>
          {{ candidate.sheet }}
        </div>
      </div>
    </div>

    <q-table
      :rows="rows"
      :columns="columns"
      :pagination="{ rowsPerPage: -1 }"
      wrap-cells
      hidde-bottom
    >
      <template v-slot:body-cell="props">
        <q-td
          :props="props"
          :style="{ backgroundColor: props.col.name == 'name' ? props.row.brainLevel.color : '' }"
        >
          <template v-if="props.col.name == 'name'">
            <div class="text-weight-bold">
              {{ props.row.brainLevel.grade }}
            </div>
            {{ props.row.brainLevel.name }}
          </template>
          <template v-else-if="props.col.name == 'growth'">
            <ul class="spl-list">
              <li>S = {{ props.row.brainLevel.S }} meses</li>
              <li>P = {{ props.row.brainLevel.P }} meses</li>
              <li>L = {{ props.row.brainLevel.L }} meses</li>
            </ul>
          </template>
          <template v-else-if="props.value">
            <q-btn @click="editRank(props.value)">
              {{ props.value.brain_function_id }}
            </q-btn>
          </template>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog">
      <q-card
        style="width: 500px"
        v-if="rank"
      >
        <q-card-section class="flex justify-between items-center q-pr-sm">
          <div class="page-title">
            {{ rank.brain_level_id }}
            {{ brainFunctions[rank.brain_function_id - 1].name }}
          </div>
          <q-btn
            style="flex: 0 0 auto;"
            flat
            round
            dense
            icon="close"
            @click="dialog = false"
          ></q-btn>
        </q-card-section>
        <q-card-section>
          <div class="flex justify-between q-mb-lg">
            <div class="impact-btn">0</div>
            <div class="impact-btn">F</div>
            <div class="impact-btn">P</div>
          </div>

          <q-input
            outlined
            stack-label
            label="Comentarios"
            type="textarea"
            v-model="rank.comments"
          ></q-input>

          <div class="q-pt-lg q-pl-none">
            <label
              for="#"
              style="margin-bottom: 14px; display: block;"
            >¿Impacto en Lateridad? (*)</label>
            <div style="margin-left: -10px;">
              <q-radio
                v-model="rank.laterality_impact"
                val="l"
                label="Izquierda"
              />
              <q-radio
                v-model="rank.laterality_impact"
                val="r"
                label="Derecha"
              />
            </div>
          </div>
        </q-card-section>
        <q-card-section class="flex justify-end">
          <q-btn
            class="q-mr-sm"
            unelevated
            outline
            color="primary"
          >Cerrar</q-btn>
          <q-btn
            unelevated
            color="primary"
          >Guardar</q-btn>
        </q-card-section>
      </q-card>
    </q-dialog>
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

.impact-btn {
  font-weight: 700;
  font-size: 25px;
  color: #001F6D;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 109px;
  height: 65px;
  border: 1px solid grey;
  border-radius: 8px;
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

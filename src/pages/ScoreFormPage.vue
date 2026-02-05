<script setup>
import notify from 'src/utils/notify'
import { DateTime } from 'luxon'
import { api } from 'src/boot/axios'
import { computed, onMounted, ref, watch } from 'vue'

import ScoresTable from '../components/ScoresTable.vue'
import EnlacDate from '../components/EnlacDate.vue'
import { useCategoryStore } from 'src/stores/category-store'

const props = defineProps({
  categoryName: { type: String, required: true }
})

const category = ref(false)
const loading = ref(false)
const savingScores = ref(false)

const searchType = ref('user')
const searchQuery = ref('')
const optionId = ref(null)

const dateISO = ref(DateTime.now().toISODate().split('T')[0])
const dayClosed = computed(() => scores.value.some(score => score.closed == 1))

function clearForm() {
  loading.value = true
  rows.value = []
  searchQuery.value = ''
  optionId.value = null
  scores.value = []
}

watch(searchType, function () {
  clearForm()
  fetchScores()
})

watch(dateISO, function () {
  clearForm()
})

const emptySearch = computed(() => {
  if (loading.value == true) {
    return false
  }

  if (results.value.length == 0){
    return true
  }

  return false
})

const deferredDate = computed(() => {
  if (!dateISO.value) return false

  const dateISOparsed = DateTime.fromISO(dateISO.value).startOf('day')
  const today = DateTime.now().startOf('day')

  // Retorna true si la fecha es estrictamente menor a hoy
  return dateISOparsed < today
})

const isClosable = computed(() => {
  return scores.value.some((score) => score.id)
})

const categoryStore = useCategoryStore()

const rows    = ref([])
const scores  = ref([])

async function fetchScores(){
  loading.value = true
  rows.value = ((await api.get(`scores/?category_id=${category.value.id}&mode=${searchType.value}`)).data.data)
  loading.value = false
}

const results = computed(()=>{
  if(!searchQuery.value) {
    return rows.value
  }
  return rows.value.filter(row => row.name.toLowerCase().includes(searchQuery.value.toLocaleLowerCase()))
})

async function closeScores(){
  scores.value = scores.value.map(score => ({...score, closed: 1}))
}

async function storeScores(closed = false) {
  let data = { scores: scores.value, closed }

  try {
    errors.value = {}
    savingScores.value = true
    await api.post('activity_daily_scores', data)
    notify.positive('Calificaciones guardas con exito')

    await fetchScores()
    scores.value = [...rows.value.find(row => row.id == optionId.value).scores]

    if( closed == 1 ){
      closeScores()
    }

  } catch (error) {
    console.log(error);
    
    notify.negative('Error al guardar calificaciones')
    if( error.formatted ){
      errors.value = error.formatted
    }
  } finally {
    savingScores.value = false
  }
}

function selectOption(option){
  if( option.id == optionId.value ){
    optionId.value = null
    scores.value = []
    return
  }
  optionId.value = option.id
  scores.value = option.scores
}

const errors = ref({})

onMounted(async () => {
  category.value = await categoryStore.getCategoryByName(props.categoryName)
  await fetchScores()
})
</script>

<template>
  <div class="row">
    <div class="col-md-8 q-mx-auto q-gutter-y-md">
      <div class="flex">
        <div class="page-title q-mb-none">
          Calificar actividades {{ category ? `- ${category.label}` : '' }}
        </div>
        <enlac-date
          v-model="dateISO"
          class="q-ml-auto"
        />
      </div>

      <div class="flex q-gutter-x-md">
        <q-radio
          v-model="searchType"
          val="user"
          label="Nombre de beneficiario"
        />
        <q-radio
          v-model="searchType"
          val="activity"
          label="Seleccionar actividad"
        />
      </div>

      <div class="q-gutter-y-md">
        <div class="flex q-gutter-x-md">
          <q-input
            type="search"
            outlined
            stack-label
            hide-bottom-space
            v-model="searchQuery"
            clearable
            style="flex: 1 1 auto"
            debounce="500"
          >
            <template v-slot:prepend>
              <q-icon name="sym_o_search" />
            </template>
          </q-input>
        </div>

        <q-list
          bordered
          v-if="results"
        >
          <template
            v-for="result in results"
            :key="result.id"
          >
            <q-item
              v-if="!optionId || result.id == optionId"
              clickable
              @click="selectOption(result)"
            >
              <q-item-section avatar>
                <q-icon name="sym_o_account_circle" />
              </q-item-section>
              <q-item-section class="two-line-ellipsis" style="font-family: monospace;">
                {{ result.name }}
              </q-item-section>
              <q-item-section side>
                <q-checkbox
                  v-model="optionId"
                  :val="result.id"
                  :true-value="result.id"
                  :false-value="null"
                  style="pointer-events: none"
                />
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </div>

      <div
        v-if="scores && scores.length && !dayClosed"
        class="flex justify-end q-gutter-x-md"
      >
        <q-btn
          v-if="isClosable"
          :disable="deferredDate || dayClosed"
          color="secondary"
          label="Cerrar dia"
          @click="storeScores(1)"
          :loading="savingScores"
        />
        <q-btn
          :disable="deferredDate || dayClosed"
          color="primary"
          label="Guardar calificaciones"
          @click="storeScores(0)"
          :loading="savingScores"
        />
      </div>

      <div v-else-if="dayClosed">
        <q-card>
          <q-card-section class="bg-positive">
            <q-icon name="sym_o_done_all" size="1.5rem" color="green-1" class="q-mr-md"/>
            <span class="text-green-1">Dia cerrado, no se admiten actualizaciones.</span>
          </q-card-section>
        </q-card>
      </div>

      <ScoresTable
        v-if="optionId"
        v-model:rows="scores"
        :readonly="deferredDate"
        :mode="searchType"
        :loading="loading"
        :disable="savingScores"
        :errors="errors"
      />

      <div
        v-if="scores && scores.length && !dayClosed"
        class="flex justify-end q-gutter-x-md"
      >
        <q-btn
          v-if="isClosable"
          :disable="deferredDate || dayClosed"
          color="secondary"
          label="Cerrar dia"
          @click="storeScores(1)"
          :loading="savingScores"
        />
        <q-btn
          :disable="deferredDate || dayClosed"
          color="primary"
          label="Guardar calificaciones"
          @click="storeScores(0)"
          :loading="savingScores"
        />
      </div>

      <div
        v-if="emptySearch"
        class="text-negative"
      >
        <q-icon name="sym_o_info" />
        No hay resultados coincidentes con la busqueda
      </div>

      <template v-if="!optionId">
        <div class="text-center">
          <q-img
            src="/public/actividades.png"
            width="200px"
          />
          <h6 class="q-my-sm">Selecciona un beneficiario o actividad</h6>
          <p>para empezar a evaluar</p>
        </div>
      </template>
    </div>
  </div>

  <q-page-sticky
    expand
    position="top"
    :offset="[0, 0]"
    class="z-top"
  >
    <q-card
      v-if="deferredDate"
      square
      class="full-width shadow-2 q-pa-sm bg-warning"
    >
      <div class="flex justify-center items-center">
        <q-icon
          name="sym_o_warning"
          class="q-mr-md"
        />
        <div>
          Estás visualizando una fecha pasada, no se admiten modificaciones.
          <q-btn
            unelevated
            dense
            label="Ir a hoy"
            @click="dateISO = new Date().toISOString().split('T')[0]"
            class="q-ml-sm q-pa-sm bg-dark text-white"
            icon="sym_o_event_upcoming"
          />
        </div>
      </div>
    </q-card>
  </q-page-sticky>
</template>

<style lang="scss">
.multi-line-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 2; /* Número de líneas */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word; /* Evita que palabras largas rompan el layout */
  max-width: 240px;
}
@mixin multi-line-ellipsis($lines: 2) {
  display: -webkit-box;
  -webkit-line-clamp: $lines;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-word;
  background: red;
  max-width: 200px;
}
</style>

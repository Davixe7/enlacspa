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

const searchType = ref('activity')
const searchQuery = ref('')
const activities = ref([])
const activityId = ref(null)
const activity = ref(null)
const candidates = ref(null)
const candidateId = ref(null)

const candidateActivities = ref([])
const activityCandidates = ref([])

const mapScores = ref([])
const currentScores = ref([])
const dateISO = ref(DateTime.now().toISODate().split('T')[0])

function clearForm() {
  candidates.value = null
  currentScores.value = []
  mapScores.value = []
  activityId.value = null
  activity.value = null
  candidateId.value = null
}

watch(searchType, function () {
  clearForm()
})

watch(dateISO, function () {
  clearForm()
})

const emptySearch = computed(() => {
  if (loading.value == true) {
    return false
  }

  if (searchType.value == 'user' && candidates.value && candidates.value.length == 0) {
    return true
  }

  if (searchType.value == 'activity' && activity.value && activityCandidates.value.length == 0) {
    return true
  }
  return false
})

async function fetchActivities() {
  try {
    loading.value = true
    activities.value = (await api.get(`activities/?category_id=${category.value.id}`)).data.data
    activities.value.unshift({ name: 'Seleccione actividad', id: null })
    activityId.value = activities.value[0].id
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function fetchActivityCandidates() {
  try {
    loading.value = true
    activityCandidates.value = (
      await api.get(`beneficiaries/?activity_id=${activityId.value}`)
    ).data.data
    activity.value = activities.value.find((act) => act.id == activityId.value)

    await fetchScores()
    candidatesToScores()
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function fetchCandidates() {
  try {
    candidateActivities.value = []
    candidateId.value = null
    candidates.value = null
    mapScores.value = []

    let params = {
      name: searchQuery.value == null ? '' : searchQuery.value,
      category_id: category.value.id
    }

    loading.value = true
    candidates.value = (await api.get('beneficiaries', { params })).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function fetchCandidateActivities(id) {
  if (candidateId.value == id) {
    candidateId.value = null
    return
  }

  try {
    loading.value = true
    candidateId.value = id
    mapScores.value = []
    candidateActivities.value = (
      await api.get(`activities/?candidate_id=${id}&category_id=${category.value.id}`)
    ).data.data

    await fetchScores()
    await activitiesToScores()
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function activitiesToScores() {
  console.log('Mapping scores for: ', candidateId.value)
  mapScores.value = candidateActivities.value.map(function (iActivity) {
    let currentScore = currentScores.value.find(function (iCurrentScore) {
      return (
        iCurrentScore.activity_id == iActivity.id && iCurrentScore.candidate_id == candidateId.value
      )
    })

    if (currentScore) {
      return {
        activity: iActivity,
        activity_id: iActivity.id,
        ...currentScore
      }
    }

    return {
      activity: iActivity,
      activity_id: iActivity.id,
      candidate_id: candidateId.value,
      score: ''
    }
  })
}

async function candidatesToScores() {
  console.log('Mapping scores for: ', activityId.value)

  mapScores.value = activityCandidates.value.map(function (iCandidate) {
    let currentScore = currentScores.value.find(function (iCurrentScore) {
      return (
        iCurrentScore.activity_id == activity.value.id &&
        iCurrentScore.candidate_id == iCandidate.id
      )
    })

    return {
      activity: activity.value,
      candidate: iCandidate,
      activity_id: activity.value.id,
      candidate_id: iCandidate.id,
      score: currentScore ? currentScore.score : ''
    }
  })
}

async function storeScores(close = false) {
  let data = { scores: mapScores.value, close }

  try {
    savingScores.value = true
    await api.post('activity_daily_scores', data)
    notify.positive('Calificaciones guardas con exito')
  } catch (error) {
    notify.negative('Error al guardar calificaciones')
    console.log(error)
  } finally {
    savingScores.value = false
  }
}

async function fetchScores() {
  try {
    loading.value = true
    const params = {
      ...(candidateId.value !== null && { candidate_id: candidateId.value }),
      ...(activityId.value !== null && { activity_id: activityId.value }),
      ...{ date: dateISO.value }
    }
    currentScores.value = (await api.get('activity_daily_scores', { params })).data.data
  } catch (error) {
    console.log(error)
    notify.negative('Error al cargar calificaciones de la fecha')
  } finally {
    loading.value = false
  }
}

const deferredDate = computed(() => {
  if (!dateISO.value) return false

  const dateISOparsed = DateTime.fromISO(dateISO.value).startOf('day')
  const today = DateTime.now().startOf('day')

  // Retorna true si la fecha es estrictamente menor a hoy
  return dateISOparsed < today
})

const isClosable = computed(() => {
  return mapScores.value.some((score) => score.id)
})

const categoryStore = useCategoryStore()

onMounted(async () => {
  category.value = await categoryStore.getCategoryByName(props.categoryName)
  await fetchActivities()
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

      <div
        class="q-gutter-y-md"
        v-if="searchType == 'user'"
      >
        <div class="flex q-gutter-x-md">
          <q-input
            type="search"
            outlined
            stack-label
            hide-bottom-space
            v-model="searchQuery"
            clearable
            style="flex: 1 1 auto"
          >
            <template v-slot:prepend>
              <q-icon name="sym_o_search" />
            </template>
          </q-input>

          <q-btn
            color="primary"
            label="Buscar"
            :loading="loading"
            @click="fetchCandidates"
          />
        </div>

        <q-list
          bordered
          v-if="candidates && candidates.length"
        >
          <template
            v-for="candidate in candidates"
            :key="candidate.id"
          >
            <q-item
              v-if="!candidateId || candidate.id == candidateId"
              clickable
              @click="fetchCandidateActivities(candidate.id)"
            >
              <q-item-section avatar>
                <q-icon name="sym_o_account_circle" />
              </q-item-section>
              <q-item-section class="two-line-ellipsis">
                {{ candidate.name }}
                <q-tooltip
                  anchor="top middle"
                  self="bottom middle"
                  max-width="300px"
                  class="bg-dark text-white shadow-4"
                >
                  {{ candidate.name }}
                </q-tooltip>
              </q-item-section>
              <q-item-section side>
                <q-checkbox
                  v-model="candidateId"
                  :val="candidate.id"
                  :true-value="candidate.id"
                  :false-value="null"
                  style="pointer-events: none"
                />
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </div>

      <div
        v-else
        class="q-gutter-y-md"
      >
        <q-select
          v-if="activities && activities.length"
          stack-label
          outlined
          dense
          hide-bottom-space
          :options="activities"
          :option-value="'id'"
          :option-label="'name'"
          :emit-value="true"
          map-options
          v-model="activityId"
          style="width: 100%"
          @update:model-value="fetchActivityCandidates"
        />
      </div>

      <div
        v-if="mapScores && mapScores.length"
        class="flex justify-end q-gutter-x-md"
      >
        <q-btn
          v-if="isClosable"
          color="secondary"
          label="Cerrar dia"
          @click="storeScores(true)"
          :loading="savingScores"
        />
        <q-btn
          :disable="deferredDate"
          color="primary"
          label="Guardar calificaciones"
          @click="storeScores"
          :loading="savingScores"
        />
      </div>

      <ScoresTable
        v-if="(searchType == 'user' && candidateId) || (searchType == 'activity' && activityId)"
        :readonly="deferredDate"
        :mode="searchType"
        :rows="mapScores"
        :loading="loading"
        :disable="savingScores"
      />

      <div
        v-if="mapScores && mapScores.length"
        class="flex justify-end q-gutter-x-md"
      >
        <q-btn
          v-if="isClosable"
          color="secondary"
          label="Cerrar dia"
          @click="storeScores(true)"
          :loading="savingScores"
        />
        <q-btn
          :disable="deferredDate"
          color="primary"
          label="Guardar calificaciones"
          @click="storeScores"
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

      <template v-if="!candidateId && !activityId">
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

<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref, watch } from 'vue'

const props = defineProps(['candidateId', 'date'])
const loading = ref(false)
const rows = ref([])

watch(
  () => props.date,
  (newDate) => {
    if (newDate !== props.date) {
      fetchScores()
    }
  }
)

async function fetchScores() {
  loading.value = true
  try {
    let params = {
      candidate_id: props.candidateId,
      date: props.date
    }
    rows.value = (
      await api.get(`beneficiaries/${props.candidateId}/reports/daily`, { params })
    ).data.data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

function getBadgeColor(score) {
  const colors = {
    'ninguno': 'red',
    'presentada': 'orange',
    'en proceso': 'orange',
    'dominada': 'green'
  }
  return colors[score] || 'primary'
}

const columns = [
  { align: 'left', name: 'activity_name', label: 'Actividad', field: 'activity_name' },
  { align: 'left', name: 'measurement_unit', label: 'Unidad', field: 'measurement_unit' },
  { align: 'left', name: 'goal_type', label: 'Tipo de Meta', field: 'goal_type' },
  { align: 'left', name: 'daily_goal', label: 'Meta diaria', field: 'daily_goal' },
  { align: 'center', name: 'score', label: 'Dato Real', field: 'score' }
]

onMounted(() => {
  fetchScores()
})
</script>

<template>
  <div>
    <div
      v-for="row in rows"
      :key="row.id"
    >
      <div class="page-title q-mb-md">{{ row.category_name }} / {{ row.plan_name }}</div>
      <q-table
        :pagination="{ rowsPerPage: 0 }"
        :rows="row.activities"
        :columns="columns"
        class="q-mb-xl"
      >
        <template v-slot:body-cell-score="props">
          <q-td class="text-center">
            <q-badge
              v-if="props.row.score"
              rounded
              :color="getBadgeColor(props.row.score)"
              class="q-px-sm"
            >
              {{ props.row.score.charAt(0).toUpperCase() + props.row.score.slice(1) }}
            </q-badge>
            <span v-else>-</span>
          </q-td>
        </template>
      </q-table>
    </div>
  </div>
</template>

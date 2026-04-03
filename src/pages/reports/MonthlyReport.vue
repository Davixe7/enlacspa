<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref, watch, defineAsyncComponent } from 'vue'
import EnlacDate from 'src/components/EnlacDate.vue'
import { exportXlsFile } from 'src/utils/exportXls'

const BeneficiaryProfile = defineAsyncComponent(
  () => import('src/components/BeneficiaryProfile.vue')
)

const props = defineProps(['candidateId'])
const startDate = ref(new Date().toISOString().split('T')[0])
const endDate = ref(new Date().toISOString().split('T')[0])
const plans = ref({})
const loading = ref(false)

async function fetchScores() {
  try {
    loading.value = true
    let params = {
      start_date: startDate.value,
      end_date: endDate.value
    }
    plans.value = (
      await api.get(`beneficiaries/${props.candidateId}/reports/monthly`, { params })
    ).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function exportXls() {
  loading.value = true
  try {
    await exportXlsFile(`beneficiaries/${props.candidateId}/reports/exportMonthly`, {
      start_date: startDate.value,
      end_date: endDate.value
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchScores()
})

watch(startDate, () => fetchScores())
watch(endDate, () => fetchScores())
</script>

<template>
  <div class="row">
    <div class="col-12 q-mb-lg">
      <Suspense>
        <template>
          <BeneficiaryProfile
            v-if="candidateId"
            :candidateId="candidateId"
          />
        </template>
      </Suspense>
    </div>
  </div>
  <div>
    <div class="row">
      <div class="col-12 col-md-4 flex q-mb-lg">
        <enlac-date
          v-model="startDate"
          class="q-mr-md"
        />
        <enlac-date v-model="endDate" />
      </div>
      <div class="q-ml-auto">
        <q-btn
          outline
          color="primary"
          label="Exportar Excel"
          @click="exportXls"
        />
      </div>
    </div>

    <template
      v-for="plan in plans"
      :key="plan.id"
    >
      <h2 class="page-title">{{ plan.category.label }} / {{ plan.name }}</h2>
      <q-markup-table class="q-mb-lg monthly-scores-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th
              v-for="activity in plan.activities"
              :key="activity.id"
            >
              {{ activity.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="n in plan.activities[0].scores.length"
            :key="n"
          >
            <td>{{ plan.activities[0].scores[n - 1].date }}</td>
            <td
              v-for="activity in plan.activities"
              :key="activity.id"
              :class="`text-${activity.scores[n - 1].color}`"
            >
              {{ activity.scores[n - 1].score }} /
              {{ activity.pivot.daily_goal }}
            </td>
          </tr>
          <tr>
            <td>Numero de días</td>
            <td
              v-for="n in plan.activities.length"
              :key="n"
            >
              Total
            </td>
          </tr>
          <tr>
            <td>{{ plan.activities[0].scores.length }}</td>
            <td
              v-for="activity in plan.activities"
              :key="activity.id"
            >
              {{ activity.total }}
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </template>
  </div>
</template>

<style>
.monthly-scores-table td {
  text-align: center;
}
</style>

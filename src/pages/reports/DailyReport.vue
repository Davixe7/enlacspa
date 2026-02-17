<script setup>
import { ref } from 'vue'
import BeneficiaryProfile from 'src/components/BeneficiaryProfile.vue'
import DailyAttendance from './DailyAttendance.vue'
import IssuesReport from './IssuesReport.vue'
import DailyScores from './DailyScores.vue'
import EnlacDate from 'src/components/EnlacDate.vue'

const props = defineProps(['candidateId'])

const candidates = ref([])
const selectedCandidate = ref(props.candidateId)
const selectedDate = ref(new Date().toISOString().split('T')[0])

</script>

<template>
  <div>
    <div class="flex justify-between q-mb-md">
      <div class="page-title q-mb-none">
        Reporte Diario
      </div>
      <q-btn flat label="Criterios de Semáforo" icon="info" />
    </div>

    <div class="flex items-center q-mb-lg">
      <q-select v-model="selectedCandidate" :options="candidates" option-value="id" option-label="full_name"
        label="Selecciona beneficiario" dense outlined class="q-mb-md" emit-value map-options />

      <EnlacDate v-model="selectedDate" class="q-mr-md" />

      <div class="q-gutter-x-md q-ml-auto flex">
        <q-btn outline color="primary" label="Exportar Excel" />
        <q-btn color="primary" label="(+) Falta del día" />
        <q-btn color="primary" label="(+) Incidencia" />
      </div>
    </div>

    <BeneficiaryProfile :candidate-id="selectedCandidate" />
    <DailyScores :candidate-id="selectedCandidate" :date="selectedDate" class="q-mb-xl" />
    <DailyAttendance :candidate-id="selectedCandidate" class="q-mb-xl" />
    <IssuesReport :candidate-id="selectedCandidate" :date="selectedDate" class="q-mb-xl" />
  </div>
</template>
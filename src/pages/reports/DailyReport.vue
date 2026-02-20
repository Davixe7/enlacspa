<script setup>
import { ref } from 'vue'
import DailyAttendance from './DailyAttendance.vue'
import DailyScores from './DailyScores.vue'
import EnlacDate from 'src/components/EnlacDate.vue'
import DailyIssues from './DailyIssues.vue'

defineProps(['candidateId'])
const selectedDate = ref(new Date().toISOString().split('T')[0])

</script>

<template>
  <div>
    <div class="flex items-center q-mb-lg">
      <EnlacDate v-model="selectedDate" class="q-mr-md" />

      <div class="q-gutter-x-md q-ml-auto flex">
        <q-btn outline color="primary" label="Exportar Excel" />
        <q-btn color="primary" label="(+) Falta del día" />
        <q-btn color="primary" label="(+) Incidencia" />
      </div>
    </div>

    <DailyScores :candidate-id="candidateId" :date="selectedDate" class="q-mb-xl" />
    <DailyAttendance :candidate-id="candidateId" class="q-mb-xl" />
    <DailyIssues :candidate-id="candidateId" :date="selectedDate" class="q-mb-xl" />
  </div>
</template>
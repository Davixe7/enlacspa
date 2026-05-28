<script setup>
import { ref } from 'vue'
import EnlacDate from 'src/components/EnlacDate.vue'
import DailyAttendance from './DailyAttendance.vue'
import DailyScores from './DailyScores.vue'
import DailyIssues from './DailyIssues.vue'
import IssuesForm from 'src/components/IssuesForm.vue'
import AbsenceForm from 'src/components/AbsenceForm.vue'
import { exportXlsFile } from 'src/utils/exportXls'

const loading = ref(true)
const props = defineProps(['candidateId'])

const selectedDate = ref(new Date().toISOString().split('T')[0])
const issuesDialog = ref(false)
const absenceDialog = ref(false)

// Ref para la tabla
const dailyIssuesRef = ref(null)

function handleIssueSaved() {
  if (dailyIssuesRef.value) {
    dailyIssuesRef.value.fetchIssues()
  }
}

async function exportXls() {
  loading.value = true
  try {
    await exportXlsFile(`beneficiaries/${props.candidateId}/reports/export`, {
      start_date: selectedDate.value,
      end_date: selectedDate.value
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="col-12">
    <q-dialog v-model="issuesDialog">
      <q-card style="width: 480px">
        <q-card-section class="flex items-center">
          <q-icon
            name="sym_o_siren"
            class="q-mr-sm"
            size="1.25rem"
          />
          <h1 class="page-subtitle q-my-none">Registrar Incidencia</h1>
          <q-btn
            @click="issuesDialog = false"
            icon="close"
            flat
            round
            dense
            class="q-ml-auto"
          />
        </q-card-section>
        <IssuesForm
          :candidate-id="candidateId"
          @close="issuesDialog = false"
          @saved="handleIssueSaved"
        />
      </q-card>
    </q-dialog>

    <q-dialog v-model="absenceDialog">
      <q-card style="width: 480px">
        <q-card-section class="flex items-center">
          <q-icon
            name="sym_o_event_busy"
            class="q-mr-sm"
            size="1.25rem"
          />
          <h1 class="page-subtitle q-my-none">Registrar Falta del Día</h1>
          <q-btn
            @click="absenceDialog = false"
            icon="close"
            flat
            round
            dense
            class="q-ml-auto"
          />
        </q-card-section>
        <AbsenceForm
          :candidate-id="candidateId"
          @close="absenceDialog = false"
        />
      </q-card>
    </q-dialog>

    <div class="flex items-center q-mb-lg">
      <EnlacDate
        v-model="selectedDate"
        class="q-mr-md"
      />
      <div class="q-gutter-x-md q-ml-auto flex">
        <q-btn
          outline
          color="primary"
          label="Exportar Excel"
          @click="exportXls"
        />
        <q-btn
          color="primary"
          label="(+) Falta del día"
          @click="absenceDialog = true"
        />
        <q-btn
          color="primary"
          label="(+) Incidencia"
          @click="issuesDialog = true"
        />
      </div>
    </div>

    <DailyScores
      :candidate-id="candidateId"
      :date="selectedDate"
      class="q-mb-xl"
    />
    <DailyAttendance
      :candidate-id="candidateId"
      class="q-mb-xl"
    />
    <DailyIssues
      ref="dailyIssuesRef"
      :candidate-id="candidateId"
      :date="selectedDate"
      class="q-mb-xl"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'src/boot/axios'
import EnlacDate from 'src/components/EnlacDate.vue'
import DailyAttendance from './DailyAttendance.vue'
import DailyScores from './DailyScores.vue'
import DailyIssues from './DailyIssues.vue'
import IssuesForm from 'src/components/IssuesForm.vue'
import AbsenceForm from 'src/components/AbsenceForm.vue'

const loading = ref(true)

const props = defineProps(['candidateId'])

const selectedDate = ref(new Date().toISOString().split('T')[0])
const issuesDialog = ref(false)
const absenceDialog = ref(false)

async function exportXls() {
  try {
    loading.value = true
    let downloadurl = `beneficiaries/${props.candidateId}/reports/export`
    let response = await api({
      url: downloadurl,
      method: 'GET',
      responseType: 'blob',
      params: {
        start_date: selectedDate.value,
        end_date: selectedDate.value
      }
    })

    const contentDisposition = response.headers['content-disposition']
    let filename = 'reporte_descargado.xlsx'

    if (contentDisposition) {
      // Ejemplo: attachment; filename="usuarios.xlsx"
      const filenameMatch = contentDisposition.match(/filename="(.+?)"/)
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1]
      }
    }

    // 3. Crear el Blob a partir de los datos de la respuesta
    const blob = new Blob([response.data], {
      type: response.headers['content-type'] // Usar el tipo MIME correcto
    })

    // 4. Iniciar la descarga usando el API del navegador
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.setAttribute('download', filename) // 👈 Aplicar el nombre del archivo
    document.body.appendChild(link)
    link.click() // 👈 Forzar el click para iniciar la descarga

    // 5. Limpieza
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url) // Liberar memoria del Blob

    console.log(`Descarga de ${filename} iniciada.`)
  } catch (error) {
    console.log(error)
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
          <q-icon name="sym_o_siren" class="q-mr-sm" size="1.25rem" />
          <h1 class="page-subtitle q-my-none">Registrar Incidencia</h1>
          <q-btn @click="issuesDialog = false" icon="close" flat round dense class="q-ml-auto" />
        </q-card-section>
        <IssuesForm :candidate-id="candidateId" @close="issuesDialog = false" />
      </q-card>
    </q-dialog>

    <q-dialog v-model="absenceDialog">
      <q-card style="width: 480px">
        <q-card-section class="flex items-center">
          <q-icon name="sym_o_event_busy" class="q-mr-sm" size="1.25rem" />
          <h1 class="page-subtitle q-my-none">Registrar Falta del Día</h1>
          <q-btn @click="absenceDialog = false" icon="close" flat round dense class="q-ml-auto" />
        </q-card-section>
        <AbsenceForm :candidate-id="candidateId" @close="absenceDialog = false" />
      </q-card>
    </q-dialog>

    <div class="flex items-center q-mb-lg">
      <EnlacDate v-model="selectedDate" class="q-mr-md" />

      <div class="q-gutter-x-md q-ml-auto flex">
        <q-btn outline color="primary" label="Exportar Excel" @click="exportXls" />
        <q-btn color="primary" label="(+) Falta del día" @click="absenceDialog = true" />
        <q-btn color="primary" label="(+) Incidencia" @click="issuesDialog = true" />
      </div>
    </div>

    <DailyScores :candidate-id="candidateId" :date="selectedDate" class="q-mb-xl" />
    <DailyAttendance :candidate-id="candidateId" class="q-mb-xl" />
    <DailyIssues :candidate-id="candidateId" :date="selectedDate" class="q-mb-xl" />
  </div>
</template>
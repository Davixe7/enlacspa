<script setup>
import { api } from 'src/boot/axios'
import { ref, onMounted, watch } from 'vue'
import { useCandidateStore } from 'src/stores/candidate-store'
import EnlacDate from 'src/components/EnlacDate.vue'
import notify from 'src/utils/notify'

const props = defineProps(['candidateId'])
const emit = defineEmits(['close'])

const candidateStore = useCandidateStore()
watch(() => props.candidateId, () => {
  candidateStore.$state.id = props.candidateId
  candidateStore.fetchCandidate()
})

const attendance = ref({
  status: 'absent',
  type: 'daily',
  candidate_id: props.candidateId,
  date: new Date().toISOString().split('T')[0],
  absence_justification_type: null,
  absence_justification_comment: null,
})
const justified = ref(false)
const type = ref(null)
const other = ref('')
const loading = ref(false)
const errors = ref({})

const types = [
  { id: 'enfermedad', label: 'Enfermedad' },
  { id: 'cita_medica', label: 'Cita Medica' },
  { id: 'vacaciones', label: 'Vacaciones' },
  { id: 'tramite_legal', label: 'Tramite Legal' },
  { id: 'otra', label: 'Otra' }
]

async function storeAbsence() {
  try {
    loading.value = true
    errors.value = {}

    if (justified.value && !attendance.value.absence_justification_type) {
      notify.negative('Seleccione el tipo de justificación')
      return
    }

    await api.post('attendances/daily', { ...attendance.value })
    notify.positive('Falta registrada con éxito')
    emit('close')
  } catch (error) {
    console.error(error)
    notify.negative('No se pudo registrar la falta')
    if (error.formatted) errors.value = error.formatted
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (props.candidateId) {
    candidateStore.$state.id = props.candidateId
    candidateStore.fetchCandidate()
  }
})
</script>

<template>
  <q-form>
    <q-markup-table flat bordered square separator="cell" dense>
      <table class="full-width custom-table">
        <tbody>
          <tr>
            <td>Beneficiario</td>
            <td class="q-pa-sm">
              <div class="q-pa-sm">{{ candidateStore ? candidateStore.full_name : 'Cargando...' }}</div>
            </td>
          </tr>

          <tr>
            <td>Fecha</td>
            <td class="q-pa-sm">
              <EnlacDate v-model="attendance.date" />
            </td>
          </tr>

          <tr>
            <td>Justificada</td>
            <td class="q-pa-sm">
              <q-radio v-model="justified" :val="true" label="Sí" />
              <q-radio v-model="justified" :val="false" label="No"
                @click="attendance.absence_justification_type = null" />
            </td>
          </tr>

          <tr v-if="justified">
            <td>Tipo</td>
            <td class="q-pa-sm">
              <q-select v-model="attendance.absence_justification_type" filled :options="types" option-label="label"
                option-value="id" emit-value map-options />
            </td>
          </tr>

          <tr v-if="justified && type === 'otra'">
            <td>Detalle</td>
            <td class="q-pa-sm">
              <q-input v-model="other" outlined />
            </td>
          </tr>

          <tr>
            <td>Comentarios</td>
            <td class="q-pa-sm">
              <q-input type="textarea" stack-label outlined hide-bottom-space
                v-model="attendance.absence_justification_comment" :error="!!errors['absence_justification_comment']"
                :error-message="errors['absence_justification_comment']" />
            </td>
          </tr>
        </tbody>
      </table>
    </q-markup-table>

    <div class="q-pa-md flex justify-end">
      <q-btn color="primary" label="Guardar" :loading="loading" @click="storeAbsence" />
    </div>
  </q-form>
</template>

<style>
th {
  text-align: left;
  font-weight: 400;
}
</style>

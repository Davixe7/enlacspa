<script setup>
import { api } from 'src/boot/axios'
import { computed, onMounted, ref } from 'vue'
import AppointmentForm from 'src/components/AppointmentForm.vue'

const props = defineProps(['candidateId'])
const candidate = ref()

onMounted(async () => {
  candidate.value = (await api.get(`candidates/${props.candidateId}`)).data.data
  appointments.value = (await api.get(`appointments/?candidate_id=${props.candidateId}`)).data.data
})

const appointmentTypes = ref(['Evaluacion', 'Médico', 'Nutrición', 'Psicología', 'Comunicación', 'Programa Escucha'])

const columns = ref([
  { name: 'type', label: 'Tipo de cita', field: (row) => appointmentTypes.value[row.type_id], align: 'left' },
  { name: 'evaluator.name', label: 'Persona', field: (row) => row.evaluator.full_name, align: 'left' },
  { name: 'date', label: 'Fecha', field: (row) => row.frontendDate, align: 'left' },
  { name: 'time', label: 'Horario', field: (row) => row.frontendTime, align: 'left' }
])

const dialog = ref(false)

const appointments = ref([])

const pastAppointments = computed(() => {
  return appointments.value.filter((appointment) => new Date(appointment.date) <= new Date())
})

const pendingAppointments = computed(() => {
  return appointments.value.filter((appointment) => new Date(appointment.date) > new Date())
})

function updateAppointments(appointment) {
  dialog.value = false
  appointments.value.push(appointment)
}
</script>

<template>
  <div class="flex items-center q-mb-lg">
    <h1
      class="page-title"
      style="margin-bottom: 0"
    >
      Registro de citas
    </h1>
    <q-btn
      @click="dialog = true"
      class="q-ml-auto"
      color="primary"
      icon="sym_o_add"
      >Programar cita</q-btn
    >
  </div>

  <h1 class="page-subtitle">Citas pendientes</h1>
  <q-table
    class="q-mb-xl"
    :rows="pendingAppointments"
    :columns="columns"
    hide-bottom
  >
  </q-table>

  <h1 class="page-subtitle">Citas previas</h1>
  <q-table
    :rows="pastAppointments"
    :columns="columns"
    hide-bottom
  >
  </q-table>

  <q-dialog v-model="dialog">
    <AppointmentForm
      :candidates="[candidate]"
      @save="updateAppointments"
    />
  </q-dialog>
</template>

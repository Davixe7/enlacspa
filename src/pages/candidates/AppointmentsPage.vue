<script setup>
import { api } from 'src/boot/axios'
import { computed, onMounted, ref } from 'vue'
import AppointmentForm from 'src/components/AppointmentForm.vue'
import notify from 'src/utils/notify'

const props = defineProps({
  candidateId: { required: true },
  readonly: { type: Boolean, default: false }
})

const candidate = ref()
const appointment = ref(null)
const dialog2 = ref(false)

function setAppointment(target) {
  appointment.value = target
  dialog2.value = true
}

const loading = ref(false)

async function updateAppointment() {
  try {
    loading.value = true
    await api.post(`appointments/${appointment.value.id}`, { ...appointment.value, _method: 'PUT' })
    notify.positive('Actualizado exitosamente')
    dialog2.value = false
  } catch (error) {
    console.log(error)
    notify.negative('No se pudo actualizar')
  } finally {
    loading.value = false
  }
}

const appointmentTypes = ref([
  'Evaluación',
  'Médico',
  'Nutrición',
  'Psicología',
  'Comunicación',
  'Programa Escucha'
])

const columns = ref([
  {
    name: 'type',
    label: 'Tipo de cita',
    field: (row) => appointmentTypes.value[row.type_id],
    align: 'left'
  },
  {
    name: 'evaluator.name',
    label: 'Persona',
    field: (row) => row.evaluator.full_name,
    align: 'left'
  },
  { name: 'date', label: 'Fecha', field: (row) => row.frontendDate, align: 'left' },
  { name: 'time', label: 'Horario', field: (row) => row.frontendTime, align: 'left' },
  { name: 'actions', label: 'Acciones' }
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

onMounted(async () => {
  candidate.value = (await api.get(`candidates/${props.candidateId}`)).data.data
  appointments.value = (await api.get(`appointments/?candidate_id=${props.candidateId}`)).data.data
  let appointmentTypesResponse = (await api.get('work_areas')).data.data
  appointmentTypes.value = appointmentTypesResponse.map((type) => type.name)
})
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
      :disable="props.readonly"
      @click="dialog = true"
      class="q-ml-auto"
      color="primary"
      icon="sym_o_add"
      label="Programar cita"
    />
  </div>

  <h1 class="page-subtitle">Citas pendientes</h1>
  <q-table
    class="q-mb-xl"
    :rows="pendingAppointments"
    :columns="columns"
    :pagination="{ rowsPerPage: 0 }"
    no-data-label="No hay citas pendientes para mostrar"
    row-key="id"
    :hide-bottom="pendingAppointments.length"
  />

  <h1 class="page-subtitle">Citas previas</h1>
  <q-table
    :rows="pastAppointments"
    :columns="columns"
    hide-bottom
    :pagination="{ rowsPerPage: 0 }"
  >
    <template v-slot:body-cell-actions="props">
      <q-td class="text-right">
        <q-btn
          icon="sym_o_comment"
          flat
          round
          dense
          @click="setAppointment(props.row)"
        />
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="dialog">
    <AppointmentForm
      :candidates="[candidate]"
      @save="updateAppointments"
      @close="dialog = false"
    />
  </q-dialog>

  <q-dialog v-model="dialog2">
    <q-card
      v-if="appointment"
      style="min-width: 680px"
    >
      <q-card-section class="flex items-center">
        <div class="page-subtitle">Detalles de la cita</div>
        <q-btn
          flat
          round
          dense
          icon="sym_o_close"
          class="q-pa-none q-ml-auto"
          @click="dialog2 = false"
        />
      </q-card-section>
      <q-card-section>
        <div class="row q-col-gutter-x-lg">
          <div class="col-5 q-gutter-y-md">
            <q-input
              outlined
              stack-label
              hide-bottom-space
              label="Nombre del Candidato / Beneficiario"
              :model-value="candidate.full_name"
              readonly
            />
            <q-input
              outlined
              stack-label
              hide-bottom-space
              label="Tipo de Cita"
              :model-value="appointmentTypes[appointment.type_id]"
              readonly
            />
            <q-input
              outlined
              stack-label
              hide-bottom-space
              label="Atenderá"
              v-model="appointment.evaluator.name"
              readonly
            />
          </div>
          <div class="col-7">
            <q-input
              outlined
              stack-label
              hide-bottom-space
              label="Comentarios / Observaciones"
              v-model="appointment.comments"
              type="textarea"
              :rows="8"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-section class="flex justify-end">
        <q-btn
          outline
          color="primary"
          @click="dialog2 = false"
          label="Cerrar"
          class="q-mr-sm"
        />
        <q-btn
          color="primary"
          label="Guardar comentarios"
          style="flex: none"
          @click="updateAppointment"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

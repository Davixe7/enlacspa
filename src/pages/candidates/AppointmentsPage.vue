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
const appointments = ref([])
const appointmentTypes = ref([])
const dialog = ref(false)
const dialog2 = ref(false)
const loading = ref(false)

onMounted(async () => {
  candidate.value = (await api.get(`candidates/${props.candidateId}`)).data.data
  let response = (await api.get('work_areas')).data.data
  response.map((item) => (appointmentTypes.value[item.id] = { label: item.name, value: item.id }))
  appointmentTypes.value[0] = { label: 'Evaluación', value: 0 }
  appointments.value = (await api.get(`appointments/?candidate_id=${props.candidateId}`)).data.data
  console.log(appointments.value)
})

function setAppointment(target) {
  appointment.value = target
  dialog2.value = true
}

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

/* const appointmentTypes = ref([
  'Evaluación',
  'Médico',
  'Nutrición',
  'Psicología',
  'Comunicación',
  'Programa Escucha'
]) */

const columns = ref([
  {
    name: 'type',
    label: 'Tipo de cita',
    field: (row) => appointmentTypes.value[row.type_id].label,
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

const pastAppointments = computed(() => {
  return appointments.value.filter((appointment) => new Date(appointment.date) <= new Date())
})

const pendingAppointments = computed(() => {
  return appointments.value.filter((appointment) => new Date(appointment.date) > new Date())
})

const medicalRecord = ref({
  id_medical_record: null,
  candidate_id: null,
  date_medical_record: null,
  hereditary_family_history: null,
  non_pathological_personal_history: null,
  perinatal_history: null,
  andrological_gynecological_obstetric_history: null,
  medical_history: null,
  psychiatric_mental_status: null,
  nervous_system: null,
  respiratory_system: null,
  cardiovascular_system: null,
  digestive_system: null,
  genitourinary_system: null,
  musculoskeletal_system: null,
  endocrine_system: null,
  sensory_system: null,
  integumentary_system: null,
  weight: null,
  height: null,
  head_circumference: null,
  heart_rate: null,
  initial_weight: null,
  weight_age: null,
  height_age: null,
  weight_height: null,
  waist_cm: null,
  hip_cm: null,
  chest_cm: null,
  brain_perimeter_cm: null,
  brachial_circumference_cm: null,
  wrist_circumference_cm: null,
  calf_circumference_cm: null,
  other: null,
  imc: null,
  respiratory_rate: null,
  temperature: null,
  general_inspection: null,
  head: null,
  mental_status: null,
  hair: null,
  neck: null,
  thorax: null,
  abdomen: null,
  genitalia: null,
  anorectal: null,
  spine: null,
  upper_lower_limbs: null,
  peripheral_vascular_system: null,
  skin_appendages: null,
  areas_dryness_excessive_sweating: null,
  diagnostic_impression: null,
  treatment: null,
  case_analysis: null,
  created_at: null,
  updated_at: null,
  status: null,
  subjetive: null,
  objective: null,
  assessment: null,
  plan: null,
  appointment_id: null,
  type_id: null,
  appointment_type: null
})

async function fetchMedicalRecord() {
  try {
    loading.value = true
    medicalRecord.value = (
      await api.get(`beneficiaries/${appointment.value.id}/medical-records`)
    ).data.data
    // console.log(medicalRecord.value)
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
async function watchRecord(target) {
  loading.value = true
  appointment.value = target
  await fetchMedicalRecord()
  console.log(medicalRecord.value)
  if (
    medicalRecord.value.appointment_type === null ||
    medicalRecord.value.appointment_type === ''
  ) {
    notify.negative('No cuenta con información')
    return
  }
  let page = medicalRecord.value.appointment_type == 1 ? 'soap' : 'historia-clinica'
  window.location.href = `#/${page}/${props.candidateId}?type_id=${medicalRecord.value.type_id}&id=${medicalRecord.value.appointment_id}&appointment_type=${medicalRecord.value.appointment_type}&ro=1`

  loading.value = false
  // console.log(target)
}
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
    :hide-bottom="pendingAppointments.length > 0"
  />

  <h1 class="page-subtitle">Citas previas</h1>
  <q-table
    :rows="pastAppointments"
    :columns="columns"
    :pagination="{ rowsPerPage: 0 }"
    no-data-label="No hay citas para mostrar"
    row-key="id"
    :hide-bottom="pastAppointments.length > 0"
  >
    <template v-slot:body-cell-actions="props">
      <q-td
        class="text-right"
        colspan="2"
      >
        <q-btn
          icon="sym_o_comment"
          flat
          round
          dense
          @click="setAppointment(props.row)"
        />
        <q-btn
          icon="sym_o_visibility"
          flat
          round
          dense
          @click="watchRecord(props.row)"
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

<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { api } from 'src/boot/axios'
import { DateTime } from 'luxon'
import ContactsPage from './ContactsPage.vue'
import MedicationsPage from './MedicationsPage.vue'
import Notify from 'src/utils/notify'
import { scrollToFirstError } from 'src/utils/focusError'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  readonly: { type: Boolean, default: false },
  candidateId: { type: String },
  notifications: { type: Boolean, default: true },
  evaluations: { type: Boolean, default: true },
  redirectTo: { type: String, default: '/candidatos' }
})

onMounted(async () => {
  evaluators.value = (await api.get('evaluators')).data.data
  if (props.candidateId) {
    candidate.value = (await api.get(`candidates/${props.candidateId}`)).data.data
    medications.value = candidate.value.medications
    evaluation_schedule.value = candidate.value.evaluation_schedule
      ? candidate.value.evaluation_schedule
      : evaluation_schedule.value
    evaluation_schedules.value = candidate.value.evaluation_schedules
      ? candidate.value.evaluation_schedules
      : []
  }
  let datetime = DateTime.fromFormat(evaluation_schedule.value.date, 'yyyy-MM-dd HH:mm:ss')
  evaluationDate.value = datetime.toFormat('dd/MM/yyyy')
  evaluationTime.value = datetime.toFormat('HH:mm')
})

function loadData() {
  let foreignColumns = [
    'first_name',
    'middle_name',
    'last_name',
    'birth_date',
    'info_channel',
    'diagnosis',
    'sheet'
  ]

  let formdata = new FormData()

  if (candidate.value.id) {
    formdata.append('_method', 'PUT')
  }

  Object.keys(candidate.value).forEach((attr) => {
    if (foreignColumns.includes(attr)) {
      formdata.append(`candidate[${attr}]`, candidate.value[attr])
    }
  })

  evaluation_schedule.value.date = fulldatetime.value
  Object.keys(evaluation_schedule.value).forEach((attr) => {
    let value = evaluation_schedule.value[attr] === null ? '' : evaluation_schedule.value[attr]
    formdata.append(`evaluation_schedule[${attr}]`, value)
  })

  contacts.value.forEach((contact, i) => {
    Object.keys(contact).forEach((contactAttr) => {
      formdata.append(
        `contacts[${i}][${contactAttr}]`,
        contacts.value[i][contactAttr] ? contacts.value[i][contactAttr] : ''
      )
    })
  })

  medications.value.forEach((med, i) => {
    Object.keys(med).forEach((medKey) => {
      formdata.append(`medications[${i}][${medKey}]`, medications.value[i][medKey])
    })
  })

  formdata.append('picture', picture.value)

  return formdata
}

async function storeCandidate() {
  loading.value = true
  errors.value = {}
  try {
    let endpoint = candidate.value.id ? `candidates/${candidate.value.id}` : 'candidates'
    await api.post(endpoint, loadData())
    Notify.positive('Guardado con éxito')
    setTimeout(() => router.push(props.redirectTo), 3000)
  } catch (error) {
    errors.value = error.status == 422 ? error.formatted : {}
    Notify.negative('Por favor, valide la informacion')
    nextTick(() => scrollToFirstError())
  }
  loading.value = false
}

const loading = ref(false)
const errors = ref({})
const evaluationDate = ref(null)
const evaluationTime = ref(null)
const fulldatetime = computed(() => {
  let newDate = DateTime.fromFormat(
    evaluationDate.value + ' ' + evaluationTime.value,
    'dd/MM/yyyy HH:mm'
  )
  return newDate.toFormat('yyyy-MM-dd HH:mm:ss')
})

const infoChannels = ref([
  'Publicidad impresa',
  'Publicidad en radio',
  'Recomendación de escuela',
  'Recomendación de personal médico',
  'Recomendación de otra persona',
  'Otro'
])
const evaluation_schedules = ref([])

const candidate = ref({
  id: null,
  first_name: '',
  middle_name: '',
  last_name: '',
  birth_date: null,
  age: null,
  chronological_age: null,
  diagnosis: '',
  info_channel: infoChannels.value[infoChannels.value.length - 1],
  sheet: 1
})
const contacts = ref([])
const medications = ref([])
const evaluators = ref([])
const evaluation_schedule = ref({
  evaluator_id: null,
  date: DateTime.now().toFormat('yyyy-MM-dd HH:mm:ss'),
  type_id: 0
})
const picture = ref(null)
const recepient = ref({ name: '', phone: '' })

const age = computed(() => {
  if (!candidate.value.birth_date) {
    return null
  }
  let birth_date = DateTime.fromISO(candidate.value.birth_date)
  let now = DateTime.now()
  let diff = now.diff(birth_date, ['years', 'months', 'days'])
  let dateString = diff.years ? `${diff.years} años` : ''
  dateString += diff.months ? ` ${Math.floor(diff.months)} meses` : ''
  dateString += diff.days ? ` ${Math.floor(diff.days)} días` : ''
  return dateString
})

const chronological_age = computed(() => {
  if (!candidate.value.birth_date) {
    return null
  }
  let birth_date = DateTime.fromISO(candidate.value.birth_date)
  let now = DateTime.now()
  let diff = now.diff(birth_date, 'months')
  return `${Math.floor(diff.months)} meses`
})
</script>

<template>
  <q-page>
    <div class="form-section">
      <div class="page-title">Datos del Candidato</div>
      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-6 q-gutter-y-lg">
          <q-input
            outlined
            stack-label
            hide-bottom-space
            label="Nombre (s)"
            v-model="candidate.first_name"
            class="q-field--required"
            :error="!!errors['candidate.first_name']"
            :error-message="errors['candidate.first_name']"
          ></q-input>
          <q-input
            outlined
            stack-label
            hide-bottom-space
            label="Apellido Paterno"
            v-model="candidate.last_name"
            class="q-field--required"
            :error="!!errors['candidate.last_name']"
            :error-message="errors['candidate.last_name']"
          ></q-input>
          <q-input
            outlined
            stack-label
            hide-bottom-space
            label="Apellido Materno"
            v-model="candidate.middle_name"
            class="q-field--required"
            :error="!!errors['candidate.middle_name']"
            :error-message="errors['candidate.middle_name']"
          ></q-input>
        </div>
        <div class="col-12 col-md-6 q-gutter-y-lg">
          <q-input
            outlined
            stack-label
            hide-bottom-space
            label="Fecha de Nacimiento"
            v-model="candidate.birth_date"
            class="q-field--required"
            :error="!!errors['candidate.birth_date']"
            :error-message="errors['candidate.birth_date']"
            type="date"
          ></q-input>
          <q-input
            readonly
            outlined
            stack-label
            hide-bottom-space
            label="Edad"
            v-model.number="age"
          ></q-input>
          <q-input
            readonly
            outlined
            stack-label
            hide-bottom-space
            label="Edad Cronológica*"
            v-model="chronological_age"
          ></q-input>
        </div>
      </div>
    </div>

    <ContactsPage
      :readonly="props.readonly"
      :candidateId="candidateId"
      @update:modelValue="(newContacts) => (contacts = [...newContacts])"
      :errors="errors"
    ></ContactsPage>

    <div class="form-section">
      <div class="page-title">¿Dónde obtuvo la información del Instituto?</div>
      <div class="row">
        <div class="col-12 col-md-7">
          <div class="flex">
            <q-radio
              v-for="channel in infoChannels"
              :key="channel"
              :label="channel"
              :val="channel"
              v-model="candidate.info_channel"
            ></q-radio>
          </div>
        </div>
      </div>
    </div>

    <div class="form-section">
      <div class="page-title">Información Médica del Candidato</div>
      <q-input
        type="textarea"
        outlined
        stack-label
        hide-bottom-space
        label="Diagnostico Médico / Síntomas *"
        v-model="candidate.diagnosis"
        :error="!!errors['candidate.diagnosis']"
        :error-message="errors['candidate.diagnosis']"
      ></q-input>
    </div>

    <MedicationsPage
      :readonly="props.readonly"
      v-model="medications"
      :candidateId="candidate.id"
      :errors="errors"
    ></MedicationsPage>

    <div class="form-section">
      <div class="page-title">Programar Evaluación</div>

      <div
        v-if="evaluations"
        class="row q-col-gutter-lg q-mb-md"
      >
        <div class="col-12 col-md-4">
          <q-select
            outlined
            stack-label
            label="Seleccione Evaluador"
            :options="evaluators"
            v-model="evaluation_schedule.evaluator_id"
            emit-value
            option-label="full_name"
            option-value="id"
            map-options
            :error="!!errors['evaluation_schedule.evaluator_id']"
            :error-message="errors['evaluation_schedule.evaluator_id']"
          ></q-select>
        </div>
        <div class="col-12 col-md-2">
          <q-input
            outlined
            stack-label
            v-model="evaluationDate"
            class="q-field--required"
            label="Seleccione fecha"
          >
            <template v-slot:append>
              <q-icon
                name="event"
                class="cursor-pointer"
              >
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-date
                    v-model="evaluationDate"
                    mask="DD/MM/YYYY"
                  >
                    <div class="row items-center justify-end">
                      <q-btn
                        v-close-popup
                        label="Cerrar"
                        color="primary"
                        flat
                      />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
        <div class="col-12 col-md-2">
          <q-input
            outlined
            stack-label
            v-model="evaluationTime"
            class="q-field--required"
            label="Horario"
          >
            <template v-slot:append>
              <q-icon
                name="access_time"
                class="cursor-pointer"
              >
                <q-popup-proxy
                  cover
                  transition-show="scale"
                  transition-hide="scale"
                >
                  <q-time v-model="evaluationTime">
                    <div class="row items-center justify-end">
                      <q-btn
                        v-close-popup
                        label="Cerrar"
                        color="primary"
                        flat
                      />
                    </div>
                  </q-time>
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>

      <div class="subtitle">Historial de Evaluaciones Re-programadas</div>
      <ul class="q-pl-md q-mt-none">
        <li
          class="q-py-md"
          v-for="schedule in evaluation_schedules"
          :key="schedule.id"
        >
          <span style="font-family: monospace; margin-right: 1rem">{{ schedule.date }}</span>
          <span style="font-family: monospace">{{ schedule.evaluator.name }}</span>
        </li>
      </ul>
    </div>

    <div
      v-if="notifications"
      class="form-section"
    >
      <div class="page-title">Herramientas Adicionales</div>
      <div class="subtitle q-my-md">Envío de Formato Inicial por WhatsApp</div>
      <div class="flex q-gutter-x-md q-mb-lg">
        <q-input
          outlined
          stack-label
          label="Nombre de la persona"
          type="text"
          v-model="recepient.name"
        ></q-input>
        <q-input
          outlined
          stack-label
          label="Celular"
          type="tel"
          mask="##########"
          v-model="recepient.phone"
        ></q-input>
        <q-btn
          style="width: 100px; height: 48px; align-self: flex-end"
          color="primary"
          >Enviar</q-btn
        >
      </div>

      <div class="subtitle q-my-md">Envío de Encuesta de Satisfacción</div>
      <div class="flex q-gutter-x-md">
        <q-input
          outlined
          stack-label
          label="Nombre de la persona"
          type="text"
          v-model="recepient.name"
        ></q-input>
        <q-input
          outlined
          stack-label
          label="Celular"
          type="tel"
          mask="##########"
          v-model="recepient.phone"
        ></q-input>
        <q-btn
          style="width: 100px; height: 48px; align-self: flex-end"
          color="primary"
          >Enviar</q-btn
        >
      </div>
    </div>

    <div class="form-section">
      <div class="subtitle q-mb-md">Foto del candidato</div>
      <div class="row">
        <q-avatar
          v-if="candidate.picture"
          size="64px"
          rounded
          class="q-mr-sm"
        >
          <q-img :src="candidate.picture"></q-img>
        </q-avatar>
        <div class="col-12 col-md-4">
          <q-file
            outlined
            stack-label
            label="Adjuntar archivo"
            icon="attach"
            v-model="picture"
          >
            <template v-slot:append>
              <q-icon name="attachment"></q-icon>
            </template>
          </q-file>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <q-btn
        :disable="props.readonly"
        :loading="loading"
        color="primary"
        @click="storeCandidate"
      >
        Guardar
      </q-btn>
    </div>
  </q-page>
</template>

<style>
.form-section {
  margin-bottom: 3rem;
}

.page-title {
  line-height: 1.3em;
  margin-bottom: 2rem;
}

.subtitle {
  color: #000;
  font-weight: 500;
  font-size: 18px;
}
</style>

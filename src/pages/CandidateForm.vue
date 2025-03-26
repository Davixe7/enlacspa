<script setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { api } from "src/boot/axios";
import { DateTime } from "luxon";
import ContactsPage from "./ContactsPage.vue";
import MedicationsPage from "./MedicationsPage.vue";
import { Notify } from "quasar";
import { scrollToFirstError } from "src/utils/focusError";

const props = defineProps(['candidateId'])

onMounted(async () => {
  evaluators.value = (await api.get('evaluators')).data.data
  evaluation_schedule.value = { evaluator_id: evaluators.value[0].id, date: DateTime.now().toFormat('yyyy-MM-dd H:mm:s') }
  if (!props.candidateId) { return }
  candidate.value = (await api.get(`candidates/${props.candidateId}`)).data.data
  medications.value = candidate.value.medications
  evaluation_schedule.value = candidate.value.evaluation_schedule ? candidate.value.evaluation_schedule : evaluation_schedule.value
  evaluation_schedules.value = candidate.value.evaluation_schedules ? candidate.value.evaluation_schedules : []
})

function loadData() {
  let foreignColumns = ['first_name', 'middle_name', 'last_name', 'birth_date', 'info_channel', 'diagnosis', 'sheet'];

  let formdata = new FormData()

  if (candidate.value.id) {
    formdata.append('_method', 'PUT')
  }

  Object.keys(candidate.value).forEach(attr => {
    if (foreignColumns.includes(attr)) {
      formdata.append(`candidate[${attr}]`, candidate.value[attr])
    }
  })

  Object.keys(evaluation_schedule.value).forEach(attr => {
    let value = evaluation_schedule.value[attr] === null ? '' : evaluation_schedule.value[attr];
    formdata.append(`evaluation_schedule[${attr}]`, value)
  })

  contacts.value.forEach((contact, i) => {
    Object.keys(contact).forEach(contactAttr => {
      formdata.append(`contacts[${i}][${contactAttr}]`, contacts.value[i][contactAttr])
    })
  })

  medications.value.forEach((med, i) => {
    Object.keys(med).forEach(medKey => {
      formdata.append(`medications[${i}][${medKey}]`, medications.value[i][medKey])
    })
  })

  formdata.append('picture', picture.value)

  return formdata;
}

async function storeCandidate() {
  loading.value = true
  errors.value = {}
  try {
    let endpoint = candidate.value.id ? `candidates/${candidate.value.id}` : 'candidates'
    await api.post(endpoint, loadData())
    Notify.create({ caption: 'Guardado con exito', icon: 'sym_o_check_circle', iconColor: 'positive' })
  }
  catch (error) {
    errors.value = error.status == 422 ? error.formatted : {}
    Notify.create({ caption: 'Por favor, valide la informacion', icon: 'sym_o_info', iconColor: 'negative' })
    nextTick(() => scrollToFirstError())
  }
  loading.value = false
}

const loading = ref(false)
const errors = ref({});

const infoChannels = ref(['Publicidad impresa', 'Publicidad en radio', 'Recomendacion de escuela', 'Recomendacion de personal medico', 'Recomendacion de otra persona', 'Otro'])
const evaluation_schedules = ref([])

const candidate = ref({ id: null, first_name: '', middle_name: '', last_name: '', birth_date: null, age: null, chronological_age: null, diagnosis: '', info_channel: infoChannels.value[infoChannels.value.length - 1], sheet: 1 })
const contacts = ref([])
const medications = ref([]);
const evaluators = ref([])
const evaluation_schedule = ref({ evaluator_id: null, date: DateTime.now().toFormat('yyyy-MM-dd H:mm:s') })
const picture = ref(null)
const recepient = ref({ name: '', phone: '' })

const age = computed(() => {
  if (!candidate.value.birth_date) { return null }
  let birth_date = DateTime.fromISO(candidate.value.birth_date)
  let now = DateTime.now()
  let diff = now.diff(birth_date, ['years', 'months', 'days'])
  let dateString = diff.years ? `${diff.years} años` : ''
  dateString += diff.months ? ` ${Math.floor(diff.months)} meses` : ''
  dateString += diff.days ? ` ${Math.floor(diff.days)} días` : ''
  return dateString
})

const chronological_age = computed(() => {
  if (!candidate.value.birth_date) { return null }
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
            :error="!!errors['candidate.first_name']"
            :error-message="errors['candidate.first_name']"
          ></q-input>
          <q-input
            outlined
            stack-label
            hide-bottom-space
            label="Apellido Materno"
            v-model="candidate.middle_name"
            :error="!!errors['candidate.middle_name']"
            :error-message="errors['candidate.middle_name']"
          ></q-input>
          <q-input
            outlined
            stack-label
            hide-bottom-space
            label="Apellido Paterno"
            v-model="candidate.last_name"
            :error="!!errors['candidate.last_name']"
            :error-message="errors['candidate.last_name']"
          ></q-input>
        </div>
        <div class="col-12 col-md-6 q-gutter-y-lg">
          <q-input
            outlined
            stack-label
            hide-bottom-space
            label="Fecha de Nacimiento"
            v-model="candidate.birth_date"
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
      :candidateId="candidateId"
      @update:modelValue="newContacts => contacts = [...newContacts]"
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
      v-model="medications"
      :candidateId="candidate.id"
      :errors="errors"
    ></MedicationsPage>

    <div class="form-section">
      <div class="page-title">Programar Evaluación</div>

      <div class="row q-col-gutter-lg q-mb-md">
        <div class="col-12 col-md-4">
          <q-select
            outlined
            stack-label
            label="Seleccione Evaluador"
            :options="evaluators"
            v-model="evaluation_schedule.evaluator_id"
            emit-value
            option-label="name"
            option-value="id"
            map-options
            :error="!!errors['evaluation_schedule.evaluator_id']"
            :error-message="errors['evaluation_schedule.evaluator_id']"
          ></q-select>
        </div>
        <div class="col-12 col-md-4">
          <q-input
            outlined
            stack-label
            label="Fecha de evaluación"
            v-model="evaluation_schedule.date"
            mask="####-##-## ##:##:00"
          ></q-input>
        </div>
      </div>

      <div class="subtitle">Historial de Evaluaciones Re-programadas</div>
      <ul class="q-pl-md q-mt-none">
        <li
          class="q-py-md"
          v-for="schedule in evaluation_schedules"
          :key="schedule.id"
        >
          <span style="font-family: monospace; margin-right: 1rem;">{{ schedule.date }}</span>
          <span style="font-family: monospace;">{{ schedule.evaluator.name }}</span>
        </li>
      </ul>
    </div>

    <div class="form-section">
      <div class="page-title">Herramientas Adicionales</div>
      <div class="subtitle">Envio de Formato Inicial por WhatsApp</div>
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
          v-model="recepient.phone"
        ></q-input>
        <q-btn
          style="width: 100px; height: 48px; align-self: flex-end"
          color="primary"
        >Enviar</q-btn>
      </div>

      <div class="subtitle q-mt-md">Envio de Encuesta de Satisfaccion</div>
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
          v-model="candidate.phone"
        ></q-input>
        <q-btn
          style="width: 100px; height: 48px; align-self: flex-end"
          color="primary"
        >Enviar</q-btn>
      </div>
    </div>

    <div class="form-section">
      <div class="subtitle">Foto del candidato</div>
      <div class="row">
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

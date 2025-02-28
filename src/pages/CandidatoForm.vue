<script setup>
import { onMounted, ref } from "vue";
import { api } from "src/boot/axios";
import ContactForm from "./ContactForm.vue";
import AddressForm from "./AddressForm.vue";
import MedicationsPage from "./MedicationsPage.vue";
import { DateTime } from "luxon";

const props = defineProps(['candidateId'])

function seed() {
  candidate.value = { "sheet": 1, "first_name": "Jim", "middle_name": "Doe", "last_name": "Smith", "birth_date": "2025-01-01", "age": 1, "chronological_age": 1, "diagnosis": "Lorem ipsum" }
  contact.value = { "first_name": "Maria", "middle_name": "Garcia", "last_name": "Salazar", "relationship": "Padre", "legal_guardian": 0, "enlac_responsible": 1, "email": "mariajoseguilarte@gmail.com", "whatsapp": '321123456', "home_phone": '321123456' }
  address.value = { "street": "5", "neighborhood": "Villa Rosa", "state": "Nueva Esparta", "postal_code": "6301", "exterior_number": "0", "city": "Porlamar", "country": "Venezuela" }
  medications.value = [{ "name": "Paracetamol", "dose": "500mg", "frequency": "1 cada 12 horas", "duration": "3 dias", "observations": "Lorem ipsum" }]
  evaluation_schedule.value = { evaluator_id: 2, date: '2025-03-01 06:00:00' }
}

const evaluators = ref([])
const evaluation_schedules = ref([])
const evaluation_schedule = ref({
  evaluator_id: null,
  date: DateTime.now().toFormat('yyyy-MM-dd H:mm:s')
})
const picture = ref(null)

onMounted(async () => {
  props.candidateId ? await fetchCandidate() : null
  fetchEvaluators()
})

async function fetchEvaluators() {
  evaluators.value = (await api.get('evaluators')).data.data
}

async function fetchCandidate() {
  candidate.value = (await api.get(`candidates/${props.candidateId}`)).data.data
  contact.value = candidate.value.contact
  address.value = contact.value.addresses[0]
  medications.value = candidate.value.medications
  evaluation_schedule.value = candidate.value.evaluation_schedule
  evaluation_schedules.value = candidate.value.evaluation_schedules
}

function loadData() {
  delete candidate.value.contact;
  delete candidate.value.conctacts;
  delete candidate.value.medications;
  delete candidate.value.evaluation_schedules;
  delete candidate.value.evaluation_schedule;
  delete contact.value.addresses;
  delete candidate.value.full_name;

  let data = {
    candidate: candidate.value,
    contact: contact.value,
    address: address.value,
    evaluation_schedule: evaluation_schedule.value,
  }

  let formdata = new FormData()
  formdata.append('picture', picture.value)

  Object.keys(data).forEach(key => {
    Object.keys(data[key]).forEach(subkey => {
      formdata.append(`${key}[${subkey}]`, data[key][subkey])
    })
  })

  medications.value.forEach((med, i) => {
    Object.keys(med).forEach(medKey => {
      formdata.append(`medications[${i}][${medKey}]`, medications.value[i][medKey])
    })
  })

  if (candidate.value.id) {
    formdata.append('_method', 'PUT')
  }

  return formdata;
}

async function storeCandidate() {
  loading.value = true
  try {
    let formdata = loadData()
    let endpoint = candidate.value.id ? `candidates/${candidate.value.id}` : 'candidates'
    await api.post(endpoint, formdata)
  }
  catch (error) {
    errors.value = error.status == 422 ? error.formatted : {}
  }
  loading.value = false
}

const loading = ref(false)
const errors = ref({});
const medications = ref([]);

const candidate = ref({
  id: null,
  first_name: '',
  middle_name: '',
  last_name: '',
  birth_date: null,
  age: null,
  chronological_age: null,
  diagnosis: 'Lorem ipsum',
});

const contact = ref({
  id: null,
  first_name: '',
  middle_name: '',
  last_name: '',
  relationship: 'Padre',
  legal_guardian: false,
  enlac_responsible: false,
  email: '',
  whatsapp: null,
  home_phone: null,
});

const address = ref({
  id: null,
  street: '',
  neighborhood: '',
  state: '',
  postal_code: '',
  exterior_number: null,
  city: '',
  country: '',
});

</script>

<template>
  <q-page>
    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 q-pb-none">
        <div
          class="page-title"
          style="border: 1px solid red"
        >
          Datos del Candidato
          <q-btn @click="seed">llenar</q-btn>
        </div>
      </div>
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
          :error="!!errors['candidate.apellido_materno']"
          :error-message="errors['candidate.apellido_materno']"
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
          outlined
          stack-label
          hide-bottom-space
          label="Edad"
          v-model.number="candidate.age"
          :error="!!errors['candidate.age']"
          :error-message="errors['candidate.age']"
          type="number"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Edad Cronológica*"
          v-model.number="candidate.chronological_age"
          :error="!!errors['cronologica']"
          :error-message="errors['cronologica']"
          type="number"
        ></q-input>
      </div>
    </div>
    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 q-pb-none">
        <div class="page-title">Información Médica del Candidato</div>
      </div>
      <div class="col-12 col-md-6">
        <q-input
          type="textarea"
          outlined
          stack-label
          hide-bottom-space
          label="Diagnostico Médico / Síntomas *"
          v-model="candidate.diagnosis"
          :error="!!errors.diagnosis"
          :error-message="errors.diagnosis"
        ></q-input>
      </div>
    </div>

    <ContactForm
      :contact="contact"
      :errors="errors"
    ></ContactForm>

    <AddressForm
      v-model="address"
      :errors="errors"
    ></AddressForm>

    <MedicationsPage
      v-model="medications"
      :candidateId="candidate.id"
      :errors="errors"
    ></MedicationsPage>

    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 q-pb-none">
        <div class="page-title">Programar Evaluación</div>
      </div>

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
        ></q-select>
      </div>
      <div class="col-12 col-md-4">
        <q-input
          outlined
          stack-label
          label="Fecha de evaluación"
          v-model="evaluation_schedule.date"
          mask="####-##-## ##:##"
        ></q-input>
      </div>
      <div class="col-12 col-md-4">
        <ul>
          <li
            v-for="schedule in evaluation_schedules"
            :key="schedule.id"
          >
            {{ `${schedule.date} - ${schedule.evaluator.name}` }}
          </li>
        </ul>
      </div>
    </div>

    <div class="row">
      <div class="col-12 col-md-4">
        <div
          class="subtitle"
          style="font-weight: 500; font-size: 18px; color: #000"
        >Foto del candidato</div>
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

    <div class="row">
      <div class="col-12 flex justify-end">
        <q-btn
          :loading="loading"
          color="primary"
          @click="storeCandidate"
        >Guardar</q-btn>
      </div>
    </div>
  </q-page>
</template>

<style>
.page-title {
  line-height: 1.3em;
  margin-bottom: 2rem;
}
</style>

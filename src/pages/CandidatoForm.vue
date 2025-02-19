<script setup>
import { onMounted, ref } from "vue";
import MedicationsPage from "./MedicationsPage.vue";
import { api } from "src/boot/axios";

const props = defineProps({
  candidateId: {
    type: String,
    nullable: true,
    default: null
  }
})
const errors = ref({});
const medications = ref([{}]);

onMounted(async () => {
  if (props.candidateId) {
    await fetchCandidate()
  }
})

async function fetchCandidate() {
  candidate.value = (await api.get(`candidates/${props.candidateId}`)).data.data
  contact.value = candidate.value.contact
  address.value = contact.value.addresses[0]
  medications.value = candidate.value.medications
}

async function storeCandidate() {
  try {
    delete candidate.value.contact;
    let data = {
      candidate: candidate.value,
      contact: contact.value,
      address: address.value,
      medications: medications.value
    }
    let response = (await api.post('candidates', data)).data.data
    console.log(response);

  } catch (error) {
    console.error(error);
  }
}

const candidate = ref({
  id: null,
  first_name: '',
  middle_name: '',
  last_name: '',
  birth_date: null,
  age: null,
  chronological_age: null,
  diagnosis: 'Lorem ipsum',
  photo: null,
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
        </div>
      </div>
      <div class="col-12 col-md-6 q-gutter-y-lg">
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Nombre (s)"
          v-model="candidate.first_name"
          :error="!!errors.nombre"
          :error-message="errors.nombre"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Apellido Materno"
          v-model="candidate.middle_name"
          :error="!!errors.apellido_materno"
          :error-message="errors.apellido_materno"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Apellido Paterno"
          v-model="candidate.last_name"
          :error="!!errors.apellido_paterno"
          :error-message="errors.apellido_paterno"
        ></q-input>
      </div>
      <div class="col-12 col-md-6 q-gutter-y-lg">
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Fecha de Nacimiento"
          v-model="candidate.birth_date"
          :error="!!errors.fecha_nacimiento"
          :error-message="errors.fecha_nacimiento"
          type="date"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Edad"
          v-model.number="candidate.age"
          :error="!!errors.edad"
          :error-message="errors.edad"
          type="number"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Edad Cronológica*"
          v-model.number="candidate.chronological_age"
          :error="!!errors.cronologica"
          :error-message="errors.cronologica"
          type="number"
        ></q-input>
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 q-pb-none">
        <div
          class="page-title"
          style="border: 1px solid red"
        >
          Datos del Contacto
        </div>
      </div>
      <div class="col-12 col-md-6 q-gutter-y-lg">
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Nombre (s)"
          v-model="contact.first_name"
          :error="!!errors.nombre"
          :error-message="errors.nombre"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Apellido Materno"
          v-model="contact.middle_name"
          :error="!!errors.apellido_materno"
          :error-message="errors.apellido_materno"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Apellido Paterno"
          v-model="contact.last_name"
          :error="!!errors.apellido_paterno"
          :error-message="errors.apellido_paterno"
        ></q-input>
        <q-select
          outlined
          stack-label
          hide-bottom-space
          label="Parentesco"
          v-model="contact.relationship"
          :error="!!errors.parentesco"
          :error-message="errors.parentesco"
          :options="[{ label: 'Padre', value: 1 }]"
          Debes
          completar
          las
          opciones
          map-options
        ></q-select>
      </div>
      <div class="col-12 col-md-6 q-gutter-y-lg">
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Correo"
          v-model="contact.email"
          :error="!!errors.email"
          :error-message="errors.email"
          type="email"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Whatsapp"
          v-model="contact.whatsapp"
          :error="!!errors.whatsapp"
          :error-message="errors.whatsapp"
          type="tel"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Telefono casa"
          v-model="contact.home_phone"
          :error="!!errors.tel"
          :error-message="errors.tel"
          type="tel"
        ></q-input>
        <div class="flex">
          <q-checkbox
            label="Tutor legal"
            v-model="contact.legal_guardian"
          ></q-checkbox>
          <q-checkbox
            label="Responsable ENLAC"
            v-model="contact.enlac_responsible"
          ></q-checkbox>
        </div>
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 q-pb-none">
        <div
          class="page-title q-mb-md"
          style="border: 1px solid red"
        >
          Domicilio
        </div>
      </div>
      <div class="col-12 col-md-6 q-gutter-y-lg">
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Calle"
          v-model="address.street"
          :error="!!errors.calle"
          :error-message="errors.calle"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Colonia"
          v-model="address.neighborhood"
          :error="!!errors.colonia"
          :error-message="errors.colonia"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Estado"
          v-model="address.state"
          :error="!!errors.estado"
          :error-message="errors.estado"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Codigo Postal"
          v-model="address.postal_code"
          :error="!!errors.codigo_postal"
          :error-message="errors.codigo_postal"
          type="number"
        ></q-input>
      </div>
      <div class="col-12 col-md-6 q-gutter-y-lg">
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Numero exterior"
          v-model="address.exterior_number"
          :error="!!errors.numero_exterior"
          :error-message="errors.numero_exterior"
          type="number"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Colonia"
          v-model="address.neighborhood"
          :error="!!errors.colonia"
          :error-message="errors.colonia"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Ciudad"
          v-model="address.city"
          :error="!!errors.ciudad"
          :error-message="errors.ciudad"
        ></q-input>
        <q-input
          outlined
          stack-label
          hide-bottom-space
          label="Pais"
          v-model="address.country"
          :error="!!errors.pais"
          :error-message="errors.pais"
        ></q-input>
        <div class="flex justify-end">
          <q-btn
            color="primary"
            icon="add"
          > Agregar Domicilio </q-btn>
        </div>
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
          :error="!!errors.diagnostico"
          :error-message="errors.diagnostico"
        ></q-input>
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 q-pb-none">
        <div class="page-title">Tabla de medications</div>
      </div>
      <div class="col-12">
        <MedicationsPage :medications="medications" />
      </div>
    </div>

    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 q-pb-none">
        <div class="page-title">Programar Evaluación</div>
      </div>
      <div class="col-12 col-md-4">
        <q-select
          outlined
          stack-label
          label="Seleccione Evaluador"
          :options="[{ label: 'Pamela Guizar', value: 1 }]"
        ></q-select>
      </div>
      <div class="col-4 col-md-4">
        <q-input
          type="date"
          outlined
          stack-label
          label="Fecha de evaluación"
        ></q-input>
      </div>

      <div class="col-12 flex justify-end">
        <q-btn
          color="primary        "
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

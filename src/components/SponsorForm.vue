<script setup>
import { onMounted, ref, reactive } from 'vue'
import { api } from 'src/boot/axios'
import { storeToRefs } from 'pinia'
import { useSponsorStore } from 'src/stores/sponsor-store'
import BeneficiariesPicker from './BeneficiariesPicker.vue'

const store = useSponsorStore()
const { errors } = storeToRefs(store)
const props = defineProps(['candidateId', 'sponsorId'])

const maritalStatusOptions = [
  { label: 'Soltero(a)', value: 'Soltero(a)' },
  { label: 'Casado(a)', value: 'Casado(a)' },
  { label: 'Divorciado(a)', value: 'Divorciado(a)' },
  { label: 'Viudo(a)', value: 'Viudo(a)' },
  { label: 'Unión Libre', value: 'Union Libre' }
]

const defaultAddress = reactive({
  type: 'home',
  street: '',
  inner_number: '',
  outer_number: '',
  neighborhood: '',
  city: '',
  state: '',
  country: '',
  email: '',
  phone: '',
  whatsapp: ''
})

const sponsor = ref({
  candidate_id: props.candidateId ? props.candidateId : null,
  name: '',
  last_name: '',
  second_last_name: '',
  company_name: null,
  birthdate: '',
  marital_status: null,
  addresses: [
    { ...defaultAddress, type: 'home' },
    { ...defaultAddress, type: 'office' }
  ]
})

onMounted(async () => {
  if (!props.sponsorId) return
  sponsor.value = (await api.get(`/sponsors/${props.sponsorId}`)).data.data
})
</script>

<template>
  <h1 class="page-title">Formato Padrino/Madrina</h1>
  <q-card class="q-mb-lg">
    <q-card-section>
      <div class="flex items-center q-pb-lg q-mr-md">
        <q-icon
          size="16px"
          name="sym_o_edit"
          class="q-mr-sm"
        />
        <div class="text-primary">Informacion personal</div>
      </div>

      <q-form
        @submit.prevent="store.saveData(sponsor)"
        class="q-gutter-y-md"
      >
        <div
          v-if="!props.sponsorId"
          class="row items-center"
        >
          <label class="col-12 col-md-6">Seleccione Candidato</label>
          <BeneficiariesPicker
            :disable="!!props.candidateId"
            class="col-12 col-md-6"
            v-model="sponsor.candidate_id"
          />
        </div>

        <div class="row items-center">
          <label class="col-12 col-md-6">Nombre(s)</label>
          <q-input
            class="col-12 col-md-6"
            outlined
            stack-label
            v-model="sponsor.name"
            hide-bottom-space
            :error="!!errors.name"
            :error-message="errors.name"
          />
        </div>

        <div class="row items-center">
          <label class="col-12 col-md-6">Apellido paterno</label>
          <q-input
            class="col-12 col-md-6"
            outlined
            stack-label
            v-model="sponsor.last_name"
            hide-bottom-space
            :error="!!errors.last_name"
            :error-message="errors.last_name"
          />
        </div>

        <div class="row items-center">
          <label class="col-12 col-md-6">Apellido materno</label>
          <q-input
            class="col-12 col-md-6"
            outlined
            stack-label
            v-model="sponsor.second_last_name"
            hide-bottom-space
            :error="!!errors.second_last_name"
            :error-message="errors.second_last_name"
          />
        </div>

        <div class="row items-center">
          <label class="col-12 col-md-6">Razón o Denominación Social</label>
          <q-input
            class="col-12 col-md-6"
            outlined
            stack-label
            v-model="sponsor.company_name"
            hide-bottom-space
            :error="!!errors.company_name"
            :error-message="errors.company_name"
          />
        </div>

        <div class="row items-center">
          <label class="col-12 col-md-6">Fecha de nacimiento</label>
          <q-input
            class="col-12 col-md-6"
            outlined
            stack-label
            v-model="sponsor.birthdate"
            mask="####-##-##"
            type="date"
            hide-bottom-space
            :error="!!errors.birthdate"
            :error-message="errors.birthdate"
          />
        </div>

        <div class="row items-center">
          <label class="col-12 col-md-6">Estado civil</label>
          <q-select
            class="col-12 col-md-6 col-md-4"
            outlined
            stack-label
            v-model="sponsor.marital_status"
            :options="maritalStatusOptions"
            hide-bottom-space
            emit-value
            map-options
            :error="!!errors.marital_status"
            :error-message="errors.marital_status"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>

  <q-card
    class="q-mb-lg"
    v-for="(address, i) in sponsor.addresses"
    :key="i"
  >
    <q-card-section>
      <div class="flex items-center q-pb-lg q-mr-md">
        <q-icon
          size="24px"
          :name="`sym_o_${address.type == 'home' ? 'home' : 'domain'}`"
          class="q-mr-md"
        ></q-icon>
        <h1 class="page-subtitle q-my-none">Domicilio {{ address.type == 'home' ? 'Local' : 'Oficina' }}</h1>
      </div>
      <q-form
        @submit.prevent="step = 3"
        class="q-gutter-y-md"
      >
        <div class="row items-center">
          <label class="col-12 col-md-6">Calle</label>
          <q-input
            class="col-12 col-md-6"
            outlined
            stack-label
            v-model="sponsor.addresses[i].street"
            hide-bottom-space
            :error="!!errors[`addresses.${i}.street`]"
            :error-message="errors[`addresses.${i}.street`]"
          />
        </div>

        <div class="row items-center">
          <label class="col-12 col-md-6">Número interior</label>
          <q-input
            class="col-12 col-md-6"
            outlined
            stack-label
            v-model="sponsor.addresses[i].inner_number"
            hide-bottom-space
            :error="!!errors[`addresses.${i}.inner_number`]"
            :error-message="errors[`addresses.${i}.inner_number`]"
          />
        </div>

        <div class="row items-center">
          <label class="col-12 col-md-6">Número exterior</label>
          <q-input
            class="col-12 col-md-6"
            outlined
            stack-label
            v-model="sponsor.addresses[i].outer_number"
            hide-bottom-space
            :error="!!errors[`addresses.${i}.outer_number`]"
            :error-message="errors[`addresses.${i}.outer_number`]"
          />
        </div>

        <div class="row items-center">
          <label class="col-12 col-md-6">Colonia</label>
          <q-input
            class="col-12 col-md-6"
            outlined
            stack-label
            v-model="sponsor.addresses[i].neighborhood"
            hide-bottom-space
            :error="!!errors[`addresses.${i}.neighborhood`]"
            :error-message="errors[`addresses.${i}.neighborhood`]"
          />
        </div>

        <div class="row items-center">
          <label class="col-12 col-md-6">Ciudad</label>
          <q-input
            class="col-12 col-md-6"
            outlined
            stack-label
            v-model="sponsor.addresses[i].city"
            hide-bottom-space
            :error="!!errors[`addresses.${i}.city`]"
            :error-message="errors[`addresses.${i}.city`]"
          />
        </div>

        <div class="row items-center">
          <label class="col-12 col-md-6">Estado</label>
          <q-input
            class="col-12 col-md-6"
            outlined
            stack-label
            v-model="sponsor.addresses[i].state"
            hide-bottom-space
            :error="!!errors[`addresses.${i}.state`]"
            :error-message="errors[`addresses.${i}.state`]"
          />
        </div>

        <div class="row items-center">
          <label class="col-12 col-md-6">País</label>
          <q-input
            class="col-12 col-md-6"
            outlined
            stack-label
            v-model="sponsor.addresses[i].country"
            hide-bottom-space
            :error="!!errors[`addresses.${i}.email`]"
            :error-message="errors[`addresses.${i}.email`]"
          />
        </div>

        <div class="row items-center">
          <label class="col-12 col-md-6">Correo electrónico</label>
          <q-input
            class="col-12 col-md-6"
            outlined
            stack-label
            v-model="sponsor.addresses[i].email"
            hide-bottom-space
            :error="!!errors[`addresses.${i}.email`]"
            :error-message="errors[`addresses.${i}.email`]"
          />
        </div>

        <div class="row items-center">
          <label class="col-12 col-md-6">Teléfono</label>
          <q-input
            class="col-12 col-md-6"
            outlined
            stack-label
            v-model="sponsor.addresses[i].phone"
            hide-bottom-space
            :error="!!errors[`addresses.${i}.phone`]"
            :error-message="errors[`addresses.${i}.phone`]"
          />
        </div>

        <div class="row items-center">
          <label class="col-12 col-md-6">WhatsApp</label>
          <q-input
            class="col-12 col-md-6"
            outlined
            stack-label
            v-model="sponsor.addresses[i].whatsapp"
            hide-bottom-space
            :error="!!errors[`addresses.${i}.whatsapp`]"
            :error-message="errors[`addresses.${i}.whatsapp`]"
          />
        </div>
      </q-form>
    </q-card-section>
  </q-card>

  <div class="flex justify-end">
    <q-btn
      @click="store.saveData(sponsor)"
      color="primary"
      :loading="store.loading"
      type="submit"
      >Enviar</q-btn
    >
  </div>
</template>

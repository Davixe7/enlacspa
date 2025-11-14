<script setup>
import { onMounted, ref, reactive, computed } from 'vue'
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

const mediaId = computed(() => {
  if (!sponsor.value.profile_picture) return null
  let regex = /\/storage\/(\d+)\//
  let matches = regex.exec(sponsor.value.profile_picture)
  if (!matches || matches.length < 1) {
    return null
  }
  return parseInt(matches[1], 10)
})

const sponsor = ref({
  candidate_id: props.candidateId ? props.candidateId : null,
  name: '',
  last_name: '',
  second_last_name: '',
  gender: null,
  company_name: null,
  birthdate: '',
  marital_status: null,
  profile_picture: null,
  profilePicture: null,
  addresses: [
    { ...defaultAddress, type: 'home' },
    { ...defaultAddress, type: 'office' }
  ],
  contact_by: 'parent'
})

const genderOptions = [
  { label: 'Hombre', value: 'male' },
  { label: 'Mujer', value: 'female' },
  { label: 'Entidad Comercial', value: 'entity' }
]

const profilePictureInput = ref(null)

async function deletePicture() {
  if (!window.confirm('Seguro que desea eliminar la foto de perfil del padrino?')) return
  try {
    await api.post(`media/${mediaId.value}`, { _method: 'DELETE' })
    sponsor.value.profile_picture = ''
  } catch (error) {
    console.log(error)
  }
}

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
        <div class="row items-center">
          <template v-if="!sponsor.profile_picture">
            <div>
              <label
                for="#"
                class="q-mb-md block"
                >Foto de perfil / Logo</label
              >
              <q-img
                width="120px"
                style="border: 1px solid var(--primary); border-radius: 3px"
                src="/profile_placeholder.jpg"
                @click="() => profilePictureInput.pickFiles()"
              />
            </div>
          </template>

          <template v-else>
            <div>
              <label
                for="#"
                class="q-mb-md block"
                >Foto de perfil / Logo</label
              >
              <q-img
                width="120px"
                :src="sponsor.profile_picture"
                style="border: 1px solid var(--primary); border-radius: 3px"
              />
            </div>
          </template>

          <q-file
            ref="profilePictureInput"
            class="col-12 col-md-6 q-ml-auto"
            dense
            outlined
            stack-label
            v-model="sponsor.profilePicture"
            hide-bottom-space
            :error="!!errors.profilePicture"
            :error-message="errors.profilePicture"
          >
            <template v-slot:append>
              <q-btn
                v-if="sponsor.profile_picture"
                unelevated
                dense
                color="negative"
                label="Eliminar actual"
                class="bg-red-3 text-red-10"
                @click="deletePicture()"
              />
              <q-icon name="attach_file" />
            </template>
          </q-file>
        </div>

        <template v-if="!props.sponsorId">
          <div class="row items-center">
            <label class="col-12 col-md-6">Seleccione Candidato</label>
            <BeneficiariesPicker
              :disable="!!props.candidateId"
              class="col-12 col-md-6"
              v-model="sponsor.candidate_id"
            />
          </div>
        </template>

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
          <label class="col-12 col-md-6">Género (optional)</label>
          <q-select
            class="col-12 col-md-6"
            outlined
            stack-label
            dense
            v-model="sponsor.gender"
            :options="genderOptions"
            hide-bottom-space
            emit-value
            map-options
            :error="!!errors.gender"
            :error-message="errors.gender"
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
            dense
            v-model="sponsor.marital_status"
            :options="maritalStatusOptions"
            hide-bottom-space
            emit-value
            map-options
            :error="!!errors.marital_status"
            :error-message="errors.marital_status"
          />
        </div>

        <div class="row items-center">
          <label class="col-12 col-md-6">¿Quién lo consiguió?</label>
          <div>
            <q-radio
              label="ENLAC"
              val="enlac"
              v-model="sponsor.contact_by"
              :error="!!errors.contact_by"
              :error-message="errors.contact_by"
              hide-bottom-space
            />

            <q-radio
              label="Padre de Familia"
              val="parent"
              v-model="sponsor.contact_by"
              :error="!!errors.contact_by"
              :error-message="errors.contact_by"
              hide-bottom-space
            />
          </div>
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
        <h1 class="page-subtitle q-my-none">
          Domicilio {{ address.type == 'home' ? 'Local' : 'Oficina' }}
        </h1>
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
      label="Enviar"
    />
  </div>
</template>

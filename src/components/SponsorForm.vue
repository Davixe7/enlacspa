<script setup>
import Notify from 'src/utils/notify';
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'

const props = defineProps(['sponsorId'])

const errors = ref({})
const loading = ref(false)

const maritalStatusOptions = [
  { label: 'Soltero(a)', value: 'Soltero(a)' },
  { label: 'Casado(a)', value: 'Casado(a)' },
  { label: 'Divorciado(a)', value: 'Divorciado(a)' },
  { label: 'Viudo(a)', value: 'Viudo(a)' },
  { label: 'Unión Libre', value: 'Union Libre' },
]
const sponsor = ref({
  name: '',
  last_name: '',
  second_last_name: '',
  company_name: null,
  birthdate: '',
  marital_status: null,
})

async function saveData() {
  loading.value = true
  try {
    let route = sponsor.value.id ? `/sponsors/${sponsor.value.id}` : '/sponsors'
    let data = sponsor.value.id ? { ...sponsor.value, _method: 'PUT' } : { ...sponsor.value }
    await api.post(route, data)
    Notify.positive('Guardado con éxito')
  }
  catch (error) {
    errors.value = error.status == 422 ? error.formatted : {}
    Notify.negative('No se pudo guardar')
  }
  loading.value = false
}

onMounted(async () => {
  if (!props.sponsorId) return
  sponsor.value = (await api.get(`/sponsors/${props.sponsorId}`)).data.data
})
</script>

<template>
  <q-card
    style="width: 440px;"
    bordered
    flat
  >
    <q-card-section>
      <div
        class="page-title"
        style="margin-bottom: 0 !important;"
      >Formato de Padrino / Madrina</div>
    </q-card-section>
    <q-card-section>
      <q-form
        @submit.prevent="saveData()"
        class="q-gutter-y-lg"
      >
        <q-input
          outlined
          stack-label
          label="Nombre(s)"
          v-model="sponsor.name"
          hide-bottom-space
          :error="!!errors.name"
          :error-message="errors.name"
        ></q-input>

        <!-- Apellido paterno -->
        <q-input
          outlined
          stack-label
          label="Apellido paterno"
          v-model="sponsor.last_name"
          hide-bottom-space
          :error="!!errors.last_name"
          :error-message="errors.last_name"
        ></q-input>

        <!-- Apellido materno -->
        <q-input
          outlined
          stack-label
          label="Apellido materno"
          v-model="sponsor.second_last_name"
          hide-bottom-space
          :error="!!errors.second_last_name"
          :error-message="errors.second_last_name"
        ></q-input>

        <!-- Nombre de la empresa -->
        <q-input
          outlined
          stack-label
          label="Razón social"
          v-model="sponsor.company_name"
          hide-bottom-space
          :error="!!errors.company_name"
          :error-message="errors.company_name"
        ></q-input>

        <!-- Fecha de nacimiento -->
        <q-input
          outlined
          stack-label
          label="Fecha de nacimiento"
          v-model="sponsor.birthdate"
          mask="####-##-##"
          type="date"
          hide-bottom-space
          :error="!!errors.birthdate"
          :error-message="errors.birthdate"
        ></q-input>

        <!-- Estado civil -->
        <q-select
          outlined
          stack-label
          label="Estado civil"
          v-model="sponsor.marital_status"
          :options="maritalStatusOptions"
          hide-bottom-space
          emit-value
          map-options
          :error="!!errors.marital_status"
          :error-message="errors.marital_status"
        ></q-select>

        <div class="flex">
          <q-btn
            type="submit"
            color="primary"
            :loading="loading"
            class="q-ml-auto"
          >
            Guardar</q-btn>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

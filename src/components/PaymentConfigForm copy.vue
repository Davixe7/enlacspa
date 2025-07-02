<script setup>
import Notify from 'src/utils/notify'
import { api } from 'src/boot/axios'
import { computed, onMounted, ref } from 'vue'
import { useSponsorStore } from 'src/stores/sponsor-store'
import { storeToRefs } from 'pinia'
import BeneficiaryProfile from './BeneficiaryProfile.vue'
import BeneficiariesPicker from './BeneficiariesPicker.vue'

const emits = defineEmits(['requestSponsor'])
const props = defineProps(['sponsorId', 'candidateId', 'paymentConfigId'])

const sponsorStore = useSponsorStore()
const { sponsors } = storeToRefs(sponsorStore)
const candidates = ref([])

const errors = ref({})
const loading = ref(false)

const paymentConfig = ref({
  sponsor_id: props.sponsorId ? props.sponsorId : null,
  candidate_id: props.candidateId ? props.candidateId : null,
  amount: 0,
  month_payday: 1,
  frequency: 1,
  address_type: 'home',
  wants_pickup: false,
  wants_reminder: false,
  wants_deductable_receipt: false,
})

async function saveData() {
  loading.value = true
  try {
    let route = paymentConfig.value.id ? `/payment_configs/${paymentConfig.value.id}` : '/payment_configs'
    let data = paymentConfig.value.id ? { ...paymentConfig.value, _method: 'PUT' } : { ...paymentConfig.value }
    await api.post(route, data)
    Notify.positive('Guardado con éxito')
  }
  catch (error) {
    errors.value = error.status == 422 ? error.formatted : {}
    Notify.negative('No se pudo guardar')
  }
  loading.value = false
}

const frequencies = ref([
  { 'label': 'Mensual', 'val': 1 },
  { 'label': 'Bimestral', 'val': 2 },
  { 'label': 'Trimestral', 'val': 3 },
  { 'label': 'Semestral', 'val': 6 },
  { 'label': 'Anual', 'val': 12 },
])

const yearlyAmount = computed(() => {
  return paymentConfig.value.amount * (12 / paymentConfig.value.frequency)
})

const monthlyAmount = computed(() => {
  return (yearlyAmount.value / 12).toFixed(2)
})

async function fetchCandidates() {
  candidates.value = (await api.get(`/candidates`)).data.data
}

onMounted(async () => {
  await fetchCandidates()
  await sponsorStore.fetchSponsors()
  if (!props.paymentConfigId) return
  paymentConfig.value = (await api.get(`/payment_configs/${props.paymentConfigId}`)).data.data
})
</script>

<template>
  <h1 class="page-title">Niveles de Aportación</h1>

  <template v-if="props.candidateId">
    <BeneficiaryProfile :candidateId="props.candidateId"
      class="q-mb-lg" />
  </template>
  <template v-else>
    <BeneficiariesPicker v-model="paymentConfig.candidate_id"
      class="q-mb-lg" />
  </template>

  <q-card style="width: 560px;"
    bordered
    flat>
    <q-card-section>
      <q-form @submit.prevent="saveData()"
        class="q-gutter-y-lg">
        <q-select :disable="!!sponsorId"
          outlined
          stack-label
          class="q-field--required"
          label="Seleccione Padrino"
          :options="sponsors"
          v-model="paymentConfig.sponsor_id"
          emit-value
          option-label="full_name"
          option-value="id"
          map-options
          hide-bottom-space></q-select>
        <div class="flex justify-end">
          <a @click.prevent="() => emits('requestSponsor')"
            style="font-size: .8rem; cursor: pointer; color: var(--q-primary); margin-top: -1rem;">
            Registrar nuevo
          </a>
        </div>

        <q-select v-show="!candidateId"
          :disable="!!candidateId"
          outlined
          stack-label
          class="q-field--required"
          label="Seleccione Ahijado"
          :options="candidates"
          v-model="paymentConfig.candidate_id"
          emit-value
          option-label="full_name"
          option-value="id"
          map-options></q-select>

        <q-input outlined
          stack-label
          class="q-field--required"
          label="Cantidad"
          v-model="paymentConfig.amount"
          hide-bottom-space
          :error="!!errors.amount"
          :error-message="errors.amount"></q-input>

        <!-- Frecuencia de Pago -->
        <div>
          <label class="label q-field__label q-pb-sm"
            style="display: block;">Frecuencia del Donativo</label>
          <div class="flex justify-between">
            <template v-for="frequency in frequencies"
              :key="frequency">
              <div class="flex column items-center">
                <div>
                  {{ frequency.val }}
                </div>
                <q-radio v-model="paymentConfig.frequency"
                  :val="frequency.val"></q-radio>
                <div>
                  {{ frequency.label }}
                </div>
              </div>
            </template>
          </div>
        </div>

        <q-input outlined
          stack-label
          label="Aportacion Anual"
          :model-value="yearlyAmount"
          type="number"
          hide-bottom-space></q-input>

        <q-input outlined
          stack-label
          label="Impacto mensual en cuota del beneficiario"
          :model-value="monthlyAmount"
          type="number"
          hide-bottom-space></q-input>

        <!-- Payday -->
        <q-input outlined
          stack-label
          label="¿Qué día del mes será su aportación?"
          v-model="paymentConfig.month_payday"
          type="number"
          hide-bottom-space
          :error="!!errors.month_payday"
          :error-message="errors.month_payday"></q-input>

        <div class="flex justify-between">
          <div class="label">Requiere que pasen a recoger su donativo?</div>
          <q-checkbox v-model="paymentConfig.wants_pickup"
            :true-value="1"
            :false-value="0"></q-checkbox>
        </div>

        <div class="flex justify-between">
          <div class="label">A cual domicilio</div>
          <div>
            <q-radio v-model="paymentConfig.address_type"
              :val="'home'"
              label="Casa"></q-radio>
            <q-radio v-model="paymentConfig.address_type"
              :val="'office'"
              label="Oficina"></q-radio>
          </div>
        </div>

        <div class="flex justify-between">
          <div class="label">Desea un recordatorio?</div>
          <q-checkbox v-model="paymentConfig.wants_reminder"
            :true-value="1"
            :false-value="0"></q-checkbox>
        </div>

        <div class="flex justify-between">
          <div class="label">Desea un recibo deducible?</div>
          <q-checkbox v-model="paymentConfig.wants_deductible_receipt"
            :true-value="1"
            :false-value="0"></q-checkbox>
        </div>

        <div class="flex">
          <q-btn type="submit"
            color="primary"
            :loading="loading"
            class="q-ml-auto">
            Guardar</q-btn>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<style>
.label::after {
  content: "*";
  color: #dc3545;
  margin-left: 1px;
}
</style>

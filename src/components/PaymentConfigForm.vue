<script setup>
import Notify from 'src/utils/notify'
import { api } from 'src/boot/axios'
import { computed, onMounted, ref } from 'vue'
import DeductibleReceiptForm from 'components/DeductibleReceiptForm.vue'

const props = defineProps(['sponsorId', 'candidateId', 'paymentConfigId'])
const emits = defineEmits(['save'])

const errors = ref({})
const loading = ref(false)

const template = {
  sponsor_id: props.sponsorId ? Number(props.sponsorId) : null,
  candidate_id: props.candidateId ? Number(props.candidateId) : null,
  amount: 0,
  month_payday: 1,
  frequency: 1,
  address_type: 'home',
  wants_pickup: 0,
  wants_reminder: 0,
  wants_deductible_receipt: 0,
  receipt: {
    rfc: '',
    company_name: '',
    fiscalRegime: '',
    cfdi: '',
    email: '',
    observations: '',
    fiscalStatus: '',
    street: '',
    external_number: '',
    neighborhood: '',
    city: '',
    zip_code: '',
    state: '',
    country: ''
  }
}
const paymentConfig = ref({ ...template })

async function saveData() {
  try {
    loading.value = true
    let route = paymentConfig.value.id ? `/payment_configs/${paymentConfig.value.id}` : '/payment_configs'
    let data = paymentConfig.value.id ? { ...paymentConfig.value, _method: 'PUT' } : { ...paymentConfig.value }
    await api.post(route, data)
    Notify.positive('Guardado con éxito')
    emits('save')
  } catch (error) {
    errors.value = error.status == 422 ? error.formatted : {}
    Notify.negative('No se pudo guardar')
  } finally {
    loading.value = false
  }
}

const frequencies = ref([
  {
    label: 'Mensual',
    val: 1
  },
  {
    label: 'Bimestral',
    val: 2
  },
  {
    label: 'Trimestral',
    val: 3
  },
  {
    label: 'Semestral',
    val: 6
  },
  {
    label: 'Anual',
    val: 12
  }
])

const yearlyAmount = computed(() => {
  return paymentConfig.value.amount * (12 / paymentConfig.value.frequency)
})

const monthlyAmount = computed(() => {
  return (yearlyAmount.value / 12).toFixed(2)
})

onMounted(async () => {
  if (props.paymentConfigId) {
    let route = `/payment_configs/${props.paymentConfigId}`
    paymentConfig.value = (await api.get(route)).data.data
    return
  }

  if (props.candidateId && props.sponsorId) {
    let route = `/payment_configs/?candidate_id=${props.candidateId}&sponsor_id=${props.sponsorId}`
    paymentConfig.value = (await api.get(route)).data.data
    return
  }
  paymentConfig.value.sponsor_id = Number(props.sponsorId)
})
</script>

<template>
  <q-card
    bordered
    flat
  >
    <q-card-section>
      <h1 class="page-title q-pb-md">Niveles de Aportación</h1>
      <q-form
        @submit.prevent="saveData()"
        class="q-gutter-y-lg split-form"
      >
        <div class="form-row">
          <label for="#">Cantidad</label>
          <q-input
            outlined
            class="q-field--required"
            v-model="paymentConfig.amount"
            hide-bottom-space
            :error="!!errors.amount"
            :error-message="errors.amount"
          ></q-input>
        </div>

        <div class="form-row">
          <label for="#">Frecuencia del donativo</label>
          <q-select
            outlined
            dense
            :options="frequencies"
            class="q-field--required"
            v-model="paymentConfig.frequency"
            option-label="label"
            option-value="val"
            map-options
            emit-value
            hide-bottom-space
            :error="!!errors.frequency"
            :error-message="errors.frequency"
          />
        </div>

        <div class="form-row">
          <label for="#">Aportacion Anual</label>
          <q-input
            outlined
            stack-label
            :model-value="yearlyAmount"
            type="number"
            hide-bottom-space
          />
        </div>

        <div class="form-row">
          <label for="#">Impacto mensual en cuota del beneficiario</label>
          <q-input
            outlined
            :model-value="monthlyAmount"
            type="number"
            hide-bottom-space
          />
        </div>

        <div class="form-row">
          <label for="#">¿Qué día del mes será su aportación?</label>
          <q-input
            outlined
            stack-label
            v-model="paymentConfig.month_payday"
            type="number"
            hide-bottom-space
            :error="!!errors.month_payday"
            :error-message="errors.month_payday"
          />
        </div>

        <div class="form-row">
          <label for="#">¿Requiere que pasen a recoger su donativo?</label>
          <div>
            <q-checkbox
              v-model="paymentConfig.wants_pickup"
              :true-value="1"
              :false-value="0"
            />
          </div>
        </div>

        <div class="form-row">
          <label for="#">¿A cual domicilio?</label>
          <div>
            <q-radio
              v-model="paymentConfig.address_type"
              :val="'home'"
              label="Casa"
            />
            <q-radio
              v-model="paymentConfig.address_type"
              :val="'office'"
              label="Oficina"
            />
          </div>
        </div>

        <div class="form-row">
          <label for="#">¿Desea un recordatorio?</label>
          <div>
            <q-checkbox
              v-model="paymentConfig.wants_reminder"
              :true-value="1"
              :false-value="0"
            />
          </div>
        </div>

        <div class="form-row">
          <label for="#">¿Desea un recibo deducible?</label>
          <div>
            <q-checkbox
              v-model="paymentConfig.wants_deductible_receipt"
              :true-value="1"
              :false-value="0"
            />
          </div>
        </div>

        <div v-if="paymentConfig.wants_deductible_receipt">
          <div class="form-section-label q-pb-md">Recibo deducible</div>
          <DeductibleReceiptForm v-model="paymentConfig.receipt" />
        </div>

        <div class="flex justify-end">
          <q-btn
            type="submit"
            color="primary"
            :loading="loading"
          >
            Guardar
          </q-btn>
        </div>
      </q-form>
    </q-card-section>
  </q-card>
</template>

<style lang="scss">
.label::after {
  content: '*';
  color: #dc3545;
  margin-left: 1px;
}
.split-form .form-row {
  display: table-row;
  > * {
    padding: 0.5rem 0;
    display: table-cell;
    width: 50%;
    &:last-child {
      text-align: right;
    }
  }
}
</style>

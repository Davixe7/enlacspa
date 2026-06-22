<script setup>
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps(['month', 'paymentBlocks', 'candidateId'])
const emit = defineEmits('close')
const payment = ref({
  year: null,
  month: 8,
  payment_method: null,
  amount: props.month.goal_amount - props.month.paid_amount,
  comments: '',
  ref: '',
  is_partial: 0,
  date: `${props.month.year}-${props.month.month}-01`,
  candidate_id: props.candidateId,
  payment_type: props.month.type
})

const multiple = ref(false)

const localPaymentBlocks = computed(() => {
  return Object.values(props.paymentBlocks[props.month.key])
})

const enabledPaymentBlocks = computed(() => {
  return localPaymentBlocks.value.map((block) => {
    let fullPaid = block.paid_amount == block.goal_amount
    block.enabled = block.payment_config_id == props.month.payment_config_id && !fullPaid
    return block
  })
})

const fullAmount = computed(() => {
  if (!Array.isArray(targetMonths.value)) {
    return 0
  }
  return targetMonths.value.reduce((amount, targetMonth) => {
    let block = enabledPaymentBlocks.value.find((block) => block.month == targetMonth.month)
    return block.goal_amount + amount
  }, 0)
})

const targetMonths = ref([])

const loading = ref(false)
const errors = ref({})

const monthNames = ref([
  '',
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
])

const paymentMethods = ref([
  { label: 'Seleccione un método', value: null },
  { label: 'Efectivo', value: 'Efectivo' },
  { label: 'Transferencia', value: 'Transferencia' },
  { label: 'Depósito', value: 'Depósito' },
  { label: 'Cheque', value: 'Cheque' },
  { label: 'Tarjeta de Débito', value: 'Tarjeta de Débito' },
  { label: 'Tarjeta de Crédito', value: 'Tarjeta de Crédito' },
  { label: 'Oxxo', value: 'Oxxo' }
])

async function storePayment() {
  try {
    errors.value = {}
    loading.value = true
    if (!validateMax()) return
    let data = {
      ...payment.value,
      multiple: multiple.value,
      targetMonths: targetMonths.value,
      payment_config_id: props.month.payment_config_id
    }
    await api.post('payments', data)
    notify.positive('Pago registrado exitosamente')
    emit('close')
  } catch (error) {
    console.log('Error al registrar pago', error.response)
    errors.value = error.formatted ? error.formatted : errors.value
    notify.negative('No se pudo guardar la información del pago')
  } finally {
    loading.value = false
  }
}

function validateMax() {
  console.log(props.month.goal_amount, props.month.paid_amount)

  if (multiple.value) {
    return true
  }

  if (payment.value.amount > props.month.goal_amount - props.month.paid_amount) {
    errors.value['amount'] = 'El monto a pagar no puede superar el monto pendiente'
    return false
  }
  return true
}

watch(
  () => targetMonths.value,
  () => {
    payment.value.amount = fullAmount.value
  }
)

onMounted(() => {
  payment.value.month = props.month.month
  payment.value.year = props.month.year
  targetMonths.value.push(
    enabledPaymentBlocks.value.find((block) => props.month.month == block.month)
  )
})
</script>

<template>
  <q-form @submit="storePayment()">
    <div class="row">
      <div :class="{ 'col-12': !multiple, 'col-md-7': multiple }">
        <q-markup-table flat>
          <tbody>
            <tr>
              <td>Multiple</td>
              <td>
                <q-checkbox
                  outlined
                  dense
                  :true-value="true"
                  :false-value="false"
                  v-model="multiple"
                  class="q-ml-xs q-mr-md"
                />
              </td>
            </tr>
            <tr>
              <td>Cobertura</td>
              <td>
                <q-radio
                  outlined
                  dense
                  :val="1"
                  label="Parcial"
                  v-model="payment.is_partial"
                  :error="!!errors.is_partial"
                  :error-message="errors.is_partial"
                  hide-bottom-space
                  class="q-ml-xs q-mr-md"
                  :disable="multiple"
                />
                <q-radio
                  outlined
                  dense
                  :val="0"
                  label="Total"
                  v-model="payment.is_partial"
                  :error="!!errors.is_partial"
                  :error-message="errors.is_partial"
                  hide-bottom-space
                  :disable="multiple"
                />
              </td>
            </tr>
            <tr>
              <td>Fecha</td>
              <td>
                <q-input
                  filled
                  :model-value="`${monthNames[month.month]} ${month.year}`"
                  hide-bottom-space
                />
              </td>
            </tr>

            <tr>
              <td>Forma de Pago</td>
              <td>
                <q-select
                  outlined
                  dense
                  :options="paymentMethods"
                  v-model="payment.payment_method"
                  :error="!!errors.payment_method"
                  :error-message="errors.payment_method"
                  emit-value
                  map-options
                  hide-bottom-space
                />
              </td>
            </tr>
            <tr>
              <td>Monto</td>
              <td>
                <q-input
                  filled
                  type="number"
                  v-model="payment.amount"
                  :error="!!errors['amount']"
                  :error-message="errors['amount']"
                  :disable="multiple"
                  hide-bottom-space
                />
              </td>
            </tr>
            <tr>
              <td>Referencia</td>
              <td>
                <q-input
                  outlined
                  v-model="payment.ref"
                  :error="!!errors['ref']"
                  :error-message="errors['ref']"
                  hide-bottom-space
                />
              </td>
            </tr>
            <tr>
              <td>Comentarios</td>
              <td>
                <q-input
                  outlined
                  v-model="payment.comments"
                  :error="!!errors['comments']"
                  :error-message="errors['comments']"
                  hide-bottom-space
                />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>

      <div
        class="col-5 q-pa-sm"
        v-if="multiple"
      >
        <div
          style="border-radius: 3px"
          class="bg-grey-2"
        >
          <q-list style="max-height: 370px; overflow: auto">
            <q-item
              v-for="item in enabledPaymentBlocks"
              :key="item.month"
              :disable="!item.enabled"
            >
              <q-item-section>
                <q-item-label>
                  {{ `${monthNames[item.month]} ${item.year}` }}
                </q-item-label>
                <q-item-label
                  caption
                  top
                >
                  {{ item.paid_amount }} / {{ item.goal_amount }}
                </q-item-label>
              </q-item-section>

              <q-item-section
                side
                top
              >
                <q-checkbox
                  v-if="!payment.is_partial"
                  v-model="targetMonths"
                  :val="item"
                  :disable="!item.enabled"
                />
                <q-radio
                  v-else
                  v-model="targetMonths"
                  :val="item.month"
                  :disable="!item.enabled"
                />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>

      <div
        class="col-md-12 q-pa-md flex justify-end"
        style="border-top: 1px solid rgba(0, 0, 0, 0.095)"
      >
        <q-btn
          type="submit"
          color="primary"
          label="Registrar pago"
          :loading="loading"
        />
      </div>
    </div>
  </q-form>
</template>

<style>
td:first-child {
  font-weight: 500;
}
</style>

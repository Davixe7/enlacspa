<script setup>
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'
import { onMounted, ref } from 'vue'
import PaymentForm from './../components/PaymentForm.vue'

const props = defineProps(['candidateId'])
const rows = ref([])
const loading = ref(false)

onMounted(() => {
  fetchSponsorships()
})

async function fetchSponsorships() {
  try {
    loading.value = true
    rows.value = (await api.get(`semaforo/?candidate_id=${props.candidateId}`)).data.data
  } catch (error) {
    console.log(error)
    notify.negative('Error al cargar los datos del semaforo')
  } finally {
    loading.value = false
  }
}

const monthShortNames = ref([
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul'
])

const month = ref({})
const paymentFormDialog = ref(false)
function createPayment(targetMonth, key) {
  if (targetMonth.paid_amount == targetMonth.goal_amount) {
    return
  }
  month.value = targetMonth
  month.value.key = key
  paymentFormDialog.value = true
}

function onPaymentSaved() {
  paymentFormDialog.value = false
  fetchSponsorships(props.candidateId)
}
</script>

<template>
  <q-dialog v-model="paymentFormDialog">
    <q-card style="max-width: 920px; width: 100%">
      <q-card-section class="flex items-center q-py-md">
        <h2 class="page-subtitle">Aplicar pago</h2>
        <q-btn
          flat
          round
          dense
          icon="close"
          class="q-ml-auto"
          @click="paymentFormDialog = false"
        />
      </q-card-section>
      <PaymentForm
        :candidate-id="props.candidateId"
        :month="month"
        :payment-blocks="rows"
        @close="onPaymentSaved"
      />
    </q-card>
  </q-dialog>

  <h1 class="page-title">Semaforo</h1>
  <q-markup-table
    :separator="'cell'"
    class="text-center"
  >
    <tbody>
      <tr>
        <td></td>
        <td
          v-for="monthName in monthShortNames"
          :key="monthName"
        >
          {{ monthName }}
        </td>
      </tr>
      <tr
        v-for="key in Object.keys(rows)"
        :key="key"
      >
        <td>{{ key }}</td>
        <td
          v-for="month in Object.values(rows[key])"
          :key="month.year"
          :class="`bg-${month.color}`"
          @click="createPayment(month, key)"
        >
          {{ month.paid_amount }} / {{ month.goal_amount }}
        </td>
      </tr>
    </tbody>
  </q-markup-table>
</template>

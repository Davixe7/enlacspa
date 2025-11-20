<script setup>
import { computed, onMounted, ref } from 'vue'
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'
import BeneficiarySponsors from 'pages/beneficiaries/BeneficiarySponsors.vue'
import { useAuthStore } from 'src/stores/user-store'

const props = defineProps(['candidateId'])
const loading = ref(false)
const candidate = ref({})
const rows = ref([])
const parentPaymentConfig = ref({
  candidate_id: props.candidateId,
  frequency: 1,
  month_payday: 1,
  address_type: 'home',
  amount: 0
})

onMounted(async () => {
  candidate.value = props.candidateId
    ? (await api.get(`beneficiaries/${props.candidateId}`)).data.data
    : {}
  rows.value = (await api.get(`payment_configs/?candidate_id=${props.candidateId}`)).data.data
  let foundParent = rows.value.find((row) => row.sponsor_id == null)
  parentPaymentConfig.value = foundParent ? foundParent : parentPaymentConfig.value
})

async function storeParentPaymentConfig() {
  try {
    loading.value = false
    let route = parentPaymentConfig.value.id
      ? `/payment_configs/${parentPaymentConfig.value.id}`
      : 'payment_configs'
    let data = parentPaymentConfig.value.id
      ? { ...parentPaymentConfig.value, _method: 'PUT' }
      : { ...parentPaymentConfig.value }
    parentPaymentConfig.value = (await api.post(route, data)).data.data
    notify.positive(`Configuracion de pago actualizada con exito`)
  } catch (error) {
    console.log(error)
    notify.negative(`Error al guardar los cambios`)
  } finally {
    loading.value = false
  }
}

const amountSponsors = computed(() => {
  if (!rows.value.length) return 0
  let total = rows.value
    .filter((row) => row.sponsor_id != null)
    .reduce((sum, row) => sum + row.monthly_amount, 0)

  return total.toFixed(2)
})

const amountEnlac = computed(() =>
  (
    Number(candidate.value.program_price) -
    amountSponsors.value -
    parentPaymentConfig.value.amount
  ).toFixed(2)
)
</script>

<template>
  <div class="row q-col-gutter-x-md">
    <div class="col-12 col-md-6">
      <BeneficiarySponsors
        :candidate-id="props.candidateId"
        :readonly="!useAuthStore().can('sponsors.update')"
      />
    </div>
    <div class="col-12 col-md-6">
      <q-card bordered>
        <q-card-section>
          <div class="page-subtitle q-my-none">Cuotas mensuales</div>
        </q-card-section>
        <q-markup-table flat>
          <tbody>
            <tr>
              <td>Cuota de Padres:</td>
              <td>
                <q-input
                  outlined
                  v-model="parentPaymentConfig.amount"
                />
              </td>
              <td>
                {{ ((parentPaymentConfig.amount / candidate?.program_price) * 100).toFixed(2) }} %
              </td>
            </tr>
            <tr>
              <td>Cuota de Padrinos:</td>
              <td>${{ amountSponsors }}</td>
              <td>{{ ((amountSponsors / candidate?.program_price) * 100).toFixed(2) }} %</td>
            </tr>
            <tr>
              <td>Cuota de ENLAC:</td>
              <td>${{ amountEnlac }}</td>
              <td>${{ ((amountEnlac / candidate?.program_price) * 100).toFixed(2) }} %</td>
            </tr>
            <tr>
              <td>Total del Programa:</td>
              <td>${{ candidate?.program_price }}</td>
            </tr>
          </tbody>
        </q-markup-table>
        <q-card-section class="flex justify-end">
          <q-btn
            outline
            color="primary"
            class="q-mr-sm"
            :to="{ name: 'beneficiaries.balances.control' }"
            >Ver detalles</q-btn
          >
          <q-btn
            color="primary"
            @click="storeParentPaymentConfig"
            >Guardar</q-btn
          >
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<style lang="scss">
.q-table {
  height: 100% !important;
}
</style>

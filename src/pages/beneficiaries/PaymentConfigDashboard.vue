<script setup>
import { computed, onMounted, ref } from 'vue'
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'
import BeneficiarySponsors from 'pages/beneficiaries/BeneficiarySponsors.vue'

const props = defineProps(['candidateId'])
const loading = ref(false)
const candidate = ref({})
const rows = ref([])
const parentPaymentConfig = ref({ candidate_id: props.candidateId, frequency: 1, month_payday: 1, address_type: 'home', amount: 0 })

onMounted(async () => {
  candidate.value = props.candidateId ? (await api.get(`beneficiaries/${props.candidateId}`)).data.data : {}
  rows.value = (await api.get(`payment_configs/?candidate_id=${props.candidateId}`)).data.data
  let foundParent = rows.value.find((row) => row.sponsor_id == null)
  parentPaymentConfig.value = foundParent ? foundParent : parentPaymentConfig.value
})

async function storeParentPaymentConfig() {
  try {
    loading.value = false
    let route = parentPaymentConfig.value.id ? `/payment_configs/${parentPaymentConfig.value.id}` : 'payment_configs'
    let data = parentPaymentConfig.value.id ? { ...parentPaymentConfig.value, _method: 'PUT' } : { ...parentPaymentConfig.value }
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
  let total = rows.value.filter((row) => row.sponsor_id != null).reduce((sum, row) => sum + row.monthly_amount, 0)
  return total.toFixed(2)
})

const amountEnlac = computed(() => (Number(candidate.value.program_price) - amountSponsors.value - parentPaymentConfig.value.amount).toFixed(2))
</script>

<template>
  <div class="row q-col-gutter-x-md">
    <div class="col-12 col-md-6">
      <BeneficiarySponsors :candidate-id="props.candidateId" />
    </div>
    <div class="col-12 col-md-6">
      <q-markup-table bordered>
        <tbody>
          <tr>
            <td colspan="2">
              <div class="page-subtitle q-my-none">Cuotas mensuales</div>
            </td>
          </tr>
          <tr>
            <td>Cuota de Padres:</td>
            <td>
              <q-input
                outlined
                v-model="parentPaymentConfig.amount"
              />
            </td>
          </tr>
          <tr>
            <td>Cuota de Padrinos:</td>
            <td>${{ amountSponsors }}</td>
          </tr>
          <tr>
            <td>Cuota de ENLAC:</td>
            <td>${{ amountEnlac }}</td>
          </tr>
          <tr>
            <td>Total del Programa:</td>
            <td>${{ candidate?.program_price }}</td>
          </tr>
          <tr>
            <td colspan="2">
              <div class="flex justify-end">
                <q-btn
                  color="primary"
                  @click="storeParentPaymentConfig"
                  >Guardar</q-btn
                >
              </div>
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </div>
</template>

<style lang="scss">
.q-table {
  height: 100% !important;
}
</style>

<script setup>
import { api } from 'src/boot/axios'
import { useAuthStore } from 'src/stores/user-store'
import notify from 'src/utils/notify'
import { computed, onMounted, ref, watch } from 'vue'

const authStore = useAuthStore()
const rows = ref([])
const props = defineProps(['candidateId'])
const errors = ref({})
const loading = ref(false)
const dialog = ref(false)
const candidate = ref({})

const amountSponsors = computed(() => {
  if (!rows.value.length) return 0
  let total = rows.value.reduce((sum, row) => sum + row.monthly_amount, 0)
  return total.toFixed(2)
})

const amountEnlac = computed(() => {
  if (!candidate.value.id) return 0
  return (candidate.value.program.price - amountSponsors.value).toFixed(2)
})

const paymentTemplate = ref({
  candidate_id: props.candidateId,
  sponsor_id: null,
  payment_type: '',
  is_partial: 0,
  date: '',
  payment_method: '',
  ref: null,
  comments: null,
  amount: 0.0,
  maxAmount: 0.0
})

const payment = ref({ ...paymentTemplate.value })

const configs = ref([])
const paymentMethods = ref([
  'Efectivo',
  'Transferencia',
  'Depósito',
  'Cheque',
  'Tarjeta de Débito',
  'Tarjeta de Crédito',
  'Oxxo'
])

async function fetchConfigs() {
  let response = (await api.get(`/test/?candidate_id=${props.candidateId}`)).data
  configs.value = { ...response, ['']: response[''] }
}

const selectedConfig = ref(null)

function setPayment(config) {
  selectedConfig.value = configs.value[config]
  let firstDue = configs.value[config].find((i) => i.status == 'red')
  firstDue = firstDue ? firstDue : configs.value[config].find((i) => i.status == 'yellow')

  let sponsorId = config ? config : null
  payment.value.maxAmount = rows.value.find((r) => r.sponsor_id == sponsorId).monthly_amount
  payment.value.sponsor_id = config
  payment.value.payment_type = config ? 'sponsor' : 'parent'
  payment.value.date = firstDue.date
  dialog.value = true
}

async function storePayment() {
  loading.value = true
  errors.value = {}
  try {
    let data = { ...payment.value }
    ;(await api.post('payments', data)).data.data
    payment.value = { ...paymentTemplate.value }
    notify.positive('Pago registrado con exito')
    dialog.value = false
    await fetchConfigs()
  } catch (error) {
    errors.value = error.formatted ? error.formatted : {}
    notify.negative('Error al registrar el pago')
  }
  loading.value = false
}

watch(
  () => payment.value,
  (newVal) => {
    if (!newVal || !selectedConfig.value) return
    if (newVal.is_partial === 0) {
      payment.value.amount = payment.value.maxAmount
    }
  },
  { deep: true }
)

onMounted(async () => {
  payment.value.payment_method = paymentMethods.value[0]
  candidate.value = (await api.get(`/candidates/${props.candidateId}`)).data.data
  rows.value = (await api.get(`payment_configs/?candidate_id=${props.candidateId}`)).data.data
  await fetchConfigs()
})
</script>

<template>
  <div>
    <q-markup-table
      bordered
      separator="cell"
    >
      <thead>
        <tr>
          <th>Concepto</th>
          <th>Ago</th>
          <th>Sep</th>
          <th>Oct</th>
          <th>Nov</th>
          <th>Dic</th>
          <th>Ene</th>
          <th>Feb</th>
          <th>Mar</th>
          <th>Abr</th>
          <th>May</th>
          <th>Jun</th>
          <th>Jul</th>
        </tr>
      </thead>
      <tbody v-if="rows && rows.length">
        <tr
          v-for="config in Object.keys(configs).reverse()"
          :key="config"
        >
          <td>
            {{
              config != ''
                ? rows.find((r) => r.sponsor?.id == config).sponsor.full_name
                : 'Cuota de padres'
            }}
          </td>
          <td
            v-for="payment in configs[config]"
            :key="payment.month"
            :class="[`bg-${payment.status}-2`]"
            @click="useAuthStore().can('payments.update') ? setPayment(config) : ''"
          >
            <div>${{ payment.abono }}</div>
          </td>
        </tr>
        <tr>
          <td>Beca ENLAC</td>
          <td
            v-for="n in 12"
            :key="n"
          >
            {{ amountEnlac }}
          </td>
        </tr>
        <tr v-if="candidate.id">
          <td>Total</td>
          <td
            v-for="n in 12"
            :key="n"
          >
            {{ candidate.program.price }}
          </td>
        </tr>
      </tbody>
    </q-markup-table>

    <q-dialog v-model="dialog">
      <q-card style="width: 560px">
        <q-card-section>
          <div class="page-subtitle q-mb-none">Aplicar Pago</div>
        </q-card-section>
        <q-markup-table
          bordered
          separator="cell"
        >
          <tbody>
            <tr>
              <th>Beneficiario</th>
              <td>{{ candidate.full_name }}</td>
            </tr>
            <tr>
              <th>Concepto</th>
              <td>
                Cuota de
                {{ payment.payment_type == 'sponsor' ? 'Padrino' : 'Padre' }}
              </td>
            </tr>
            <tr>
              <th>Pago</th>
              <td>
                <q-radio
                  label="Parcial"
                  v-model="payment.is_partial"
                  :val="1"
                  :true-val="1"
                />
                <q-radio
                  label="Total"
                  v-model="payment.is_partial"
                  :val="0"
                  :true-val="0"
                />
              </td>
            </tr>
            <tr>
              <th>Fecha de Pago</th>
              <td>
                <q-input
                  outlined
                  v-model="payment.date"
                  :error="!!errors.date"
                  :error-message="errors.date"
                  hide-bottom-space
                  type="date"
                />
              </td>
            </tr>
            <tr>
              <th>Forma de Pago</th>
              <td>
                <q-select
                  outlined
                  dense
                  :options="paymentMethods"
                  v-model="payment.payment_method"
                  :error="!!errors.payment_method"
                  :error-message="errors.payment_method"
                  hide-bottom-space
                />
              </td>
            </tr>
            <tr>
              <th>Referencia</th>
              <td>
                <q-input
                  outlined
                  v-model="payment.ref"
                  :error="!!errors.ref"
                  :error-message="errors.ref"
                  hide-bottom-space
                />
              </td>
            </tr>
            <tr>
              <th>Comentarios</th>
              <td>
                <q-input
                  outlined
                  v-model="payment.comments"
                  :error="!!errors.comments"
                  :error-message="errors.comments"
                  hide-bottom-space
                />
              </td>
            </tr>
            <tr>
              <th>Monto</th>
              <td>
                <q-input
                  outlined
                  :disable="!payment.is_partial"
                  v-model="payment.amount"
                  :error="!!errors.amount"
                  :error-message="errors.amount"
                  hide-bottom-space
                />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
        <q-card-section>
          <div class="flex">
            <div>
              <div class="text-caption color-grey">Registrado por:</div>
              <div>
                {{ authStore.data.user.name }}
              </div>
            </div>
            <q-btn
              class="q-ml-auto"
              @click="storePayment"
              :loading="loading"
              color="primary"
              label="Guardar"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<style scoped>
.text-center {
  text-align: center;
}
th {
  text-align: left;
  font-size: 14px;
  font-weight: 600;
}
</style>

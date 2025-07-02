<script setup>
import { api } from "src/boot/axios";
import notify from "src/utils/notify";
import { computed, onMounted, ref } from "vue";

const rows = ref([]);
const props = defineProps(["candidateId"]);
const errors = ref({});
const loading = ref(false);
const dialog = ref(false);
const candidate = ref({});

const amountSponsors = computed(() => {
  if (!rows.value.length) return 0;
  let total = rows.value.reduce((sum, row) => sum + row.monthly_amount, 0);
  return total.toFixed(2);
});

const amountEnlac = computed(() => {
  if (!candidate.value.id) return 0;
  return (candidate.value.program.price - amountSponsors.value).toFixed(2);
});

const payment = ref({
  candidate_id: props.candidateId,
  sponsor_id: null,
  payment_type: "",
  is_partial: 0,
  date: "",
  payment_method: "",
  ref: null,
  comments: null,
  amount: 0.0,
});

const configs = ref([]);
const paymentMethods = ref([
  "Efectivo",
  "Transferencia",
  "Depósito",
  "Cheque",
  "Tarjeta de Débito",
  "Tarjeta de Crédito",
  "Oxxo",
]);

async function fetchConfigs() {
  let response = (await api.get("/test")).data;
  configs.value = { ...response, [""]: response[""] };
}

onMounted(async () => {
  payment.value.payment_method = paymentMethods.value[0];

  candidate.value = (
    await api.get(`/candidates/${props.candidateId}`)
  ).data.data;

  rows.value = (
    await api.get(`payment_configs/?candidate_id=${props.candidateId}`)
  ).data.data;

  await fetchConfigs();
});

function setPayment(config) {
  let firstDue = configs.value[config].find((i) => i.status == "red");
  firstDue = firstDue
    ? firstDue
    : configs.value[config].find((i) => i.status == "yellow");

  payment.value.sponsor_id = config;
  payment.value.payment_type = config ? "sponsor" : "parent";
  payment.value.date = firstDue.date;
  dialog.value = true;
}

async function storePayment() {
  loading.value = true;
  try {
    let data = { ...payment.value };
    (await api.post("payments", data)).data.data;
    notify.positive("Pago registrado con exito");
    dialog.value = false;
    await fetchConfigs();
  } catch (error) {
    errors.value = error.formatted ? error.formatted : {};
    notify.negative("Error al registrar el pago");
  }
  loading.value = false;
}
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
      <tbody>
        <tr
          v-for="config in Object.keys(configs).reverse()"
          :key="config"
        >
          <td>Cuota de {{ config == "" ? "Padres" : "Padrinos" }}</td>
          <td
            v-for="payment in configs[config]"
            :key="payment.month"
            :class="[`bg-${payment.status}-2`]"
            @click="setPayment(config)"
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
                {{ payment.payment_type == "sponsor" ? "Padrino" : "Padre" }}
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
                ></q-radio>
                <q-radio
                  label="Total"
                  v-model="payment.is_partial"
                  :val="0"
                  :true-val="0"
                ></q-radio>
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
                ></q-input>
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
                ></q-select>
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
                ></q-input>
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
                ></q-input>
              </td>
            </tr>
            <tr>
              <th>Monto</th>
              <td>
                <q-input
                  outlined
                  v-model="payment.amount"
                  :error="!!errors.amount"
                  :error-message="errors.amount"
                  hide-bottom-space
                ></q-input>
              </td>
            </tr>
            <!-- <template v-if="configs">
              <tr>
                <th colspan="2">Pagos realizados en el mes</th>
              </tr>
              <tr>
                <th class="text-center">Fecha</th>
                <th class="text-center">Monto</th>
              </tr>
              <tr class="text-center">
                <td>25 Ene 2025</td>
                <td>1000.00</td>
              </tr>
            </template> -->
          </tbody>
        </q-markup-table>
        <q-card-section>
          <div class="flex justify-end">
            <q-btn
              @click="storePayment"
              :loading="loading"
              color="primary"
              >Guardar</q-btn
            >
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

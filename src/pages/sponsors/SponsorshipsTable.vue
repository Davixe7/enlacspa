<script setup>
import { api } from 'src/boot/axios'
import { ref, onMounted } from 'vue'
import PaymentConfigForm from 'src/components/PaymentConfigForm.vue'
import Notify from 'src/utils/notify'

const props = defineProps(['sponsorId'])
const paymentConfigs = ref([])
const dialog = ref(false)
const cancelDialog = ref(false)
const cancellationReason = ref('')
const selectedRow = ref(null)
const paymentConfigId = ref(null)
const logs = ref([])
const logsDialog = ref(false)

const frecuencies = {
  0.5: 'Quincenal',
  1: 'Mensual',
  2: 'Bimestral',
  3: 'Trimestral',
  6: 'Semestral',
  12: 'Anual'
}

const columns = ref([
  {
    name: 'candidate',
    field: (row) => row.candidate.full_name,
    label: 'Nombre del Candidato',
    sortable: true,
    align: 'left'
  },
  { name: 'id', field: 'id', label: 'Folio', sortable: true, align: 'left' },
  {
    name: 'amount',
    field: 'amount',
    label: 'Monto ($)',
    format: (val) => Number(val).toFixed(2),
    sortable: true,
    align: 'left'
  },
  {
    name: 'created_at',
    field: 'created_at',
    label: 'Patrocina desde',
    format: (val) => (val ? val : 'N/A'),
    sortable: true,
    align: 'left'
  },
  {
    name: 'frequency',
    field: (row) => frecuencies[Number(row.frequency)] || 'N/A',
    label: 'Frecuencia',
    sortable: true,
    align: 'left'
  },
  { name: 'actions', label: 'Acciones', sortable: false, align: 'right' }
])

const fetchPaymentConfigs = async () => {
  try {
    const { data } = await api.get(`/payment_configs/?sponsor_id=${props.sponsorId}`)
    paymentConfigs.value = data.data
  } catch (e) {
    console.error('Error al cargar configuraciones:', e)
  }
}

onMounted(fetchPaymentConfigs)

function editPaymentConfig(id) {
  paymentConfigId.value = id
  dialog.value = true
}

function openCancelDialog(row) {
  selectedRow.value = row
  cancellationReason.value = ''
  cancelDialog.value = true
}

async function confirmCancel() {
  try {
    let data = { cancellation_reason: cancellationReason.value }
    await api.delete(`/payment_configs/${selectedRow.value.id}`, { data })

    Notify.warning(
      'Patrocinio cancelado correctamente. Recuerda hablar con los padres de familia para reponer la aportación de Padrinos.'
    )
    cancelDialog.value = false
    await fetchPaymentConfigs()
  } catch (e) {
    console.log(e)
    Notify.negative('Error al cancelar patrocinio')
  }
}

function onSave() {
  dialog.value = false
  fetchPaymentConfigs()
}

async function showLogs(id) {
  try {
    const { data } = await api.get(`/payment_configs/${id}/history-logs`)
    logs.value = data.data
    logsDialog.value = true
  } catch (e) {
    console.log(e)
    Notify.negative('No se pudo cargar el historial')
  }
}
</script>

<template>
  <q-table
    flat
    bordered
    :rows="paymentConfigs"
    :columns="columns"
    hide-bottom
    row-key="id"
  >
    <template v-slot:body-cell-actions="slotProps">
      <q-td class="text-right">
        <q-btn
          @click="editPaymentConfig(slotProps.row.id)"
          icon="edit"
          flat
          round
        />
        <q-btn
          @click="openCancelDialog(slotProps.row)"
          icon="link_off"
          flat
          round
          color="negative"
        >
          <q-tooltip>Cancelar patrocinio</q-tooltip>
        </q-btn>
        <q-btn
          @click="showLogs(slotProps.row.id)"
          icon="history"
          flat
          round
          color="primary"
        >
          <q-tooltip>Ver historial de movimientos</q-tooltip>
        </q-btn>
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="dialog">
    <PaymentConfigForm
      :payment-config-id="paymentConfigId"
      @save="onSave"
    />
  </q-dialog>

  <q-dialog
    v-model="cancelDialog"
    persistent
  >
    <q-card style="min-width: 450px">
      <q-card-section>
        <div class="text-h6">Cancelar patrocinio</div>
      </q-card-section>

      <q-card-section>
        <p>
          ¿Por qué deseas cancelar el patrocinio de
          <strong>{{ selectedRow?.candidate.full_name }}</strong
          >?
        </p>
        <q-input
          v-model="cancellationReason"
          label="Motivo de la cancelación"
          type="textarea"
          outlined
          autofocus
          class="q-mt-sm"
          :rules="[
            (val) => (val && val.length > 5) || 'El motivo debe tener al menos 6 caracteres'
          ]"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Volver"
          color="grey"
          v-close-popup
        />
        <q-btn
          label="Confirmar Cancelación"
          color="negative"
          :disable="!cancellationReason || cancellationReason.length <= 5"
          @click="confirmCancel"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-dialog v-model="logsDialog">
    <q-card style="width: 500px">
      <q-card-section>
        <div class="text-h6">Historial de Movimientos</div>
      </q-card-section>

      <q-card-section>
        <q-list separator>
          <q-item
            v-for="(log, index) in logs"
            :key="index"
          >
            <q-item-section>
              <q-item-label>{{ log.action }}</q-item-label>
              <q-item-label caption>{{ log.date }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <div class="text-caption text-grey">{{ log.reason }}</div>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

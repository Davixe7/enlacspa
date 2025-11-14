<script setup>
import { api } from 'src/boot/axios'
import { ref, onMounted } from 'vue'
import PaymentConfigForm from 'src/components/PaymentConfigForm.vue'
import { useQuasar } from 'quasar'
const $q = useQuasar()

const props = defineProps(['sponsorId'])
const paymentConfigs = ref([])
const dialog = ref(false)

const columns = ref([
  {
    name: 'name',
    field: (row) => row.candidate.full_name,
    label: 'Nombre del Candidato',
    sortable: true,
    align: 'left'
  },
  { name: 'amount', field: 'id', label: 'Folio', sortable: true, align: 'left' },
  { name: 'created_at', field: 'amount', label: 'Monto', sortable: true, align: 'left' },
  { name: 'frequency', field: 'frequency', label: 'Frecuencia ', sortable: true, align: 'left' },
  { name: 'actions', label: 'Acciones', sortable: false, align: 'right' }
])

const paymentConfigId = ref(null)

function editPaymentConfig(id) {
  paymentConfigId.value = id
  dialog.value = true
}

onMounted(async () => {
  paymentConfigs.value = (
    await api.get(`/payment_configs/?sponsor_id=${props.sponsorId}`)
  ).data.data
})

async function unlinkSponsor(row) {
  $q.dialog({
    title: 'Cancelar patrocinio',
    message: `¿Seguro que deseas cancelar el patrocinio al beneficiario ${row.candidate.full_name}?`,
    cancel: true,
    ok: { label: 'Sí, cancelar', color: 'negative' }
  }).onOk(async () => {
    try {
      const { data } = await api.delete(`/payment_configs/${row.id}`)
      $q.notify({
        type: 'warning',
        message: data.message
      })
      // refrescar la tabla
      paymentConfigs.value = (
        await api.get(`/payment_configs/?sponsor_id=${props.sponsorId}`)
      ).data.data
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error al cancelar patrocinio' })
      console.error(e)
    }
  })
}
</script>

<template>
  <q-table
    flat
    bordered
    :rows="paymentConfigs"
    :columns="columns"
    hide-bottom
  >
    <template v-slot:body-cell-actions="props">
      <q-td class="text-right">
        <q-btn
          @click="editPaymentConfig(props.row.id)"
          icon="edit"
          flat
          round
        ></q-btn>

        <q-btn
          @click="unlinkSponsor(props.row)"
          icon="link_off"
          flat
          round
          color="negative"
        >
          <q-tooltip>Cancelar patrocinio</q-tooltip>
        </q-btn>
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="dialog">
    <PaymentConfigForm
      :payment-config-id="paymentConfigId"
      @save="dialog = false"
    />
  </q-dialog>
</template>

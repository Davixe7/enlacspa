<script setup>
import { api } from 'src/boot/axios'
import { ref } from 'vue'
import { onMounted } from 'vue'
import PaymentConfigForm from 'src/components/PaymentConfigForm.vue'

const props = defineProps(['sponsorId'])
const paymentConfigs = ref([])
const dialog = ref(false)

const columns = ref([
  { name: 'name', field: (row) => row.candidate.full_name, label: 'Nombre del Candidato', sortable: true, align: 'left' },
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
  paymentConfigs.value = (await api.get(`/payment_configs/?sponsor_id=${props.sponsorId}`)).data.data
})
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
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="dialog">
    <PaymentConfigForm :payment-config-id="paymentConfigId" />
  </q-dialog>
</template>

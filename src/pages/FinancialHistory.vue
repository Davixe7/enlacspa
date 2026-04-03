<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'
import { exportXlsFile } from 'src/utils/exportXls'
const props = defineProps(['candidateId'])
const loading = ref(true)
const rows = ref([])
const columns = ref([
  { align: 'left', name: 'date', label: 'Fecha', field: 'date' },
  {
    align: 'left',
    name: 'user',
    label: 'Registrado por',
    field: (row) => `${row.user.name} ${row.user.last_name}`
  },
  { align: 'left', name: 'payment_type', label: 'Concepto', field: 'payment_type' },
  { align: 'left', name: 'amount', label: 'Monto', field: 'amount' },
  { align: 'left', name: 'scope', label: 'Cobertura', field: 'scope' },
  { align: 'left', name: 'ref', label: 'Referencia', field: 'ref' },
  { align: 'left', name: 'comments', label: 'Comentarios', field: 'comments' },
  { align: 'right', name: 'payment_method', label: 'Metodo de pago', field: 'payment_method' }
])
onMounted(async () => {
  rows.value = (await api.get(`/payments/?candidate_id=${props.candidateId}`)).data.data
})

async function exportXls() {
  loading.value = true
  try {
    await exportXlsFile(`payments/${props.candidateId}/export`)
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <div class="flex q-py-md items-center">
    <h1 class="page-title q-mb-none page-title--no-margin">Tesorería / Historial de Pagos</h1>
    <q-btn
      class="q-mr-md q-ml-auto"
      @click="exportXls"
      label="Exportar a Excel"
      color="green"
      icon="sym_o_file_export"
      unelevated
      outline
    />
    <q-btn
      class=""
      :to="`/tesoreria`"
      label="Regresar"
      flat
    />
  </div>
  <q-table
    :rows="rows"
    :columns="columns"
    :pagination="{ rowsPerPage: 0 }"
    hide-bottom
  />
</template>

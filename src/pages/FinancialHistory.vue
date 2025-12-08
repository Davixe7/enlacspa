<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'
const props = defineProps(['candidateId'])
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
</script>
<template>
  <div class="flex">
    <h1 class="page-title">Tesorería / Historial de Pagos</h1>
    <router-link
      class="q-mr-md q-ml-auto"
      :to="`/tesoreria/${props.candidateId}/historial`"
      >Exportar a Excel</router-link
    >
    <router-link :to="`/tesoreria`">Regresar</router-link>
  </div>
  <q-table
    :rows="rows"
    :columns="columns"
    :pagination="{ rowsPerPage: 0 }"
    hide-bottom
  />
</template>

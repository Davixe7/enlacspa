<script setup>
import { onMounted, ref } from 'vue'
import { api } from 'src/boot/axios'

onMounted(async () => {
  rows.value = (await api.get('beneficiaries')).data.data
})

const rows = ref([])
const columns = ref([
  {
    name: 'name',
    label: 'Nombre del Beneficiario',
    field: 'name',
    align: 'left',
    sortable: true
  },
  {
    name: 'sheet',
    label: 'Folio',
    field: 'sheet',
    align: 'left',
    sortable: true
  },
  {
    name: 'status',
    label: 'Estatus',
    field: 'status',
    align: 'left',
    sortable: true
  },
  {
    name: 'onboard_at',
    label: 'Fecha de ingreso',
    field: 'onboard_at',
    align: 'left',
    sortable: true
  },
  {
    name: 'program_name',
    label: 'Programa',
    field: 'program_name',
    align: 'left',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]);

</script>

<template>
  <h1 class="page-title">Beneficiarios</h1>
  <q-table
    :rows="rows"
    :columns="columns"
    :pagination="{ rowsPerPage: 0 }"
    hide-bottom
  >
    <template v-slot:body-cell-actions="props">
      <q-td>
        <q-btn
          round
          unelevated
          icon="sym_o_attach_money"
          :to="`beneficiarios/${props.row.id}/cuotas`"
        />
      </q-td>
    </template>
  </q-table>
</template>

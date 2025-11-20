<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'
import PaymentConfigForm from 'src/components/PaymentConfigForm.vue'

onMounted(async () => {
  sponsors.value = (await api.get('sponsors')).data.data
})

const dialog2 = ref(false)
const sponsorId = ref(null)
const sponsors = ref([])
const columns = ref([
  {
    name: 'name',
    field: 'name',
    label: 'Nombre del Padrino',
    sortable: true,
    align: 'left'
  },
  { name: 'id', field: 'id', label: 'Folio', sortable: true, align: 'left' },
  {
    name: 'created_at',
    field: 'created_at',
    label: 'Fecha de registro',
    sortable: true,
    align: 'left'
  },
  {
    name: 'candidates_count',
    field: 'candidates_count',
    label: 'Beneficiarios que apoya',
    sortable: true,
    align: 'left'
  },
  { name: 'actions', label: 'Acciones', sortable: false, align: 'right' }
])
</script>

<template>
  <div class="flex items-center q-mb-md">
    <h1 class="page-title q-my-none">Padrinos</h1>
    <q-btn
      class="q-ml-auto"
      color="primary"
      icon="sym_o_add"
      to="/padrinos/registrar"
      label="Agregar Padrino"
    />
  </div>

  <q-table
    flat
    bordered
    hide-bottom
    :rows="sponsors"
    :columns="columns"
  >
    <template v-slot:body-cell-actions="props">
      <q-td class="text-right">
        <q-btn
          flat
          round
          icon="sym_o_visibility"
          :to="`/padrinos/${props.row.id}`"
        />
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="dialog2">
    <PaymentConfigForm :sponsor-id="sponsorId" />
  </q-dialog>
</template>

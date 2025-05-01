<script setup>
import { api } from 'src/boot/axios';
import { onMounted, ref } from 'vue';
//import SponsorForm from 'src/components/SponsorForm.vue';
import PaymentConfigForm from 'src/components/PaymentConfigForm.vue';

onMounted(async () => {
  sponsors.value = (await api.get('sponsors')).data.data
})

const dialog = ref(false)
const dialog2 = ref(false)
const sponsorId = ref(null)
const sponsors = ref([])
const columns = ref([
  { name: 'name', field: 'name', label: 'Nombre del Padrino', sortable: true, align: 'left' },
  { name: 'id', field: 'id', label: 'Folio', sortable: true, align: 'left' },
  { name: 'created_at', field: 'entry_date', label: 'Fecha de ingreso', sortable: true, align: 'left' },
  { name: 'candidates_count', field: 'candidates_count', label: 'Beneficiarios que apoya', sortable: true, align: 'left' },
  { name: 'actions', label: 'Acciones', sortable: false, align: 'right' },
])

function createSponsor() {
  sponsorId.value = null
  dialog.value = true
}

function editSponsor(id) {
  sponsorId.value = id
  dialog.value = true
}

function addCandidate(id) {
  sponsorId.value = id
  dialog2.value = true
}
</script>

<template>
  <div class="flex items-center">
    <h1 class="page-title">
      Padrinos
    </h1>
    <q-btn
      class="q-ml-auto"
      color="primary"
      icon="sym_o_add"
      @click="createSponsor"
    >Agregar Padrino
    </q-btn>
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
          icon="sym_o_edit"
          @click="editSponsor(props.row.id)"
        ></q-btn>
        <q-btn
          flat
          round
          icon="sym_o_diversity_1"
          @click="addCandidate(props.row.id)"
        ></q-btn>
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="dialog2">
    <PaymentConfigForm :sponsor-id="sponsorId" />
  </q-dialog>

  <q-dialog v-model="dialog">
    <SponsorForm :sponsor-id="sponsorId" />
  </q-dialog>
</template>

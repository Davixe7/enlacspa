<script setup>
import { computed, onMounted, ref } from 'vue'
import CandidateProfile from 'src/components/CandidateProfile.vue'
import { api } from 'src/boot/axios'

const props = defineProps(['candidateId'])
const candidate = ref({})
const season = ref('2024-2025')

onMounted(async () => {
  candidate.value = props.candidateId
    ? (await api.get(`beneficiaries/${props.candidateId}`)).data.data
    : {}

  rows.value = (await api.get(`payment_configs/?candidate_id=${props.candidateId}`)).data.data
})

const totales = computed(() => {
  let padres = Number(rows.value.reduce((total, row) => total + (row.sponsor_id ? 0 : Number(row.amount)), 0));
  let padrinos = Number(rows.value.reduce((total, row) => total + (row.sponsor_id ? Number(row.amount) : 0), 0));

  return [
    { label: 'Cuota de Padres', amount: padres },
    { label: 'Cuota de Padrinos', amount: padrinos },
    { label: 'Beca ENLAC', amount: Number(candidate.value.program_price) - padres - padrinos },
    { label: 'Total del Programa', amount: Number(candidate.value.program_price) },
  ]
})

const rows = ref([])
const columns = ref([
  {
    name: 'label',
    label: 'label',
    field: 'label',
    align: 'left',
    sortable: false
  },
  {
    name: 'amount',
    label: 'Monto',
    field: row => '$ ' + row.amount.toFixed(2),
    align: 'left'
  }
]);

</script>

<template>

  <CandidateProfile
    :candidateId="candidateId"
    v-if="false"
  />

  <q-table
    flat
    bordered
    title="Configuración de Cuotas"
    :rows="totales"
    :columns="columns"
    hide-bottom
  >
    <template v-slot:header>
      <q-tr>
        <q-th colspan="2">Cuotas Mensuales</q-th>
      </q-tr>
    </template>

    <template v-slot:top-right>
      <div class="flex items-center">
        <q-select
          dense
          outlined
          :options="['2024-2025']"
          v-model="season"
          class="q-mr-md"
        />

        <q-btn
          color="primary"
          icon="sym_o_add"
          label="Agregar Padrinos"
          to="cuotas/registrar"
        ></q-btn>
      </div>
    </template>
  </q-table>
</template>

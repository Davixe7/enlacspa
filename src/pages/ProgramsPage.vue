<script setup>
import { api } from 'src/boot/axios'
import { onMounted } from 'vue'
import { ref } from 'vue'
import BeneficiaryProfile from './../components/BeneficiaryProfile.vue'

const props = defineProps(['candidateId'])
const loading = ref(false)

const columns = ref([
  { name: 'plan_type', label: 'Plan', field: (row) => row.plan_type.label, align: 'left' },
  { name: 'plan', label: 'Tipo de plan', field: (row) => row.plan.name, align: 'left' },
  { name: 'name', label: 'Nombre del plan', field: 'name', align: 'left' },
  { name: 'created_at', label: 'Fecha de Elaboración', field: 'created_at', align: 'left' },
  {
    name: 'status',
    label: 'Estatus',
    field: (row) => (row.status ? 'Activo' : 'Inactivo'),
    align: 'left'
  },
  { name: 'actions', label: 'Acciones', align: 'right' }
])

const rows = ref([])

async function fetchPrograms() {
  try {
    loading.value = true
    rows.value = (await api.get(`personal_programs/?candidate_id=${props.candidateId}`)).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPrograms()
})
</script>

<template>
  <div class="flex items-center">
    <div class="page-title">Programa Individual</div>
    <q-btn
      class="q-ml-auto"
      color="primary"
      icon="sym_o_add"
      label="Nuevo"
      :to="`/beneficiarios/${props.candidateId}/crear-programa`"
    />
  </div>

  <BeneficiaryProfile
    :candidateId="props.candidateId"
    class="q-mb-md"
  />

  <q-table
    flat
    bordered
    :columns="columns"
    :rows="rows"
    :pagination="{ rowsPerPage: 0 }"
  >
    <template v-slot:body-cell-actions="props">
      <q-td>
        <div class="q-table__actions">
          <q-btn
            flat
            round
            dense
            icon="sym_o_edit"
            @click="alert(props.row.id)"
          />
          <q-btn
            flat
            round
            dense
            icon="sym_o_visibility"
            :to="`/programas/${props.row.id}`"
          />
        </div>
      </q-td>
    </template>
    <template v-slot:bottom>
      <div class="flex justify-end full-width">
        Mostrando un total de: {{ rows.length }} resultados
      </div>
    </template>
  </q-table>
</template>

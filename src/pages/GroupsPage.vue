<script setup>
//import { api } from 'src/boot/axios'
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'

const loading = ref(false)
const data = ref([])
async function fetchData() {
  try {
    loading.value = true
    data.value = (await api.get('groups')).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const columns = ref([
  { name: 'name', label: 'Nombre', field: 'name', sortable: false, align: 'left' },
  {
    name: 'program.name',
    label: 'Programa',
    field: (row) => row.program?.name,
    sortable: false,
    align: 'left'
  },
  {
    name: 'candidates_count',
    label: 'Número de Beneficiarios',
    field: 'candidates_count',
    sortable: false,
    align: 'left'
  },
  {
    name: 'leader',
    label: 'Titular',
    field: (row) => row.titular,
    sortable: false,
    align: 'left'
  },
  {
    name: 'assistant',
    label: 'Asistente',
    field: (row) => row.asistente,
    sortable: false,
    align: 'left'
  },
  {
    name: 'actions',
    label: 'Acciones',
    sortable: false,
    align: 'right'
  }
])
onMounted(() => fetchData())
</script>

<template>
  <div class="flex justify-between items-center q-mb-md">
    <h1 class="page-title q-my-none">Catálogo de Grupos</h1>
    <q-btn
      icon="sym_o_add"
      color="primary"
      to="/grupos/crear"
      label="Nuevo grupo"
    />
  </div>

  <q-table
    :rows="data"
    :columns="columns"
    flat
    bordered
  >
    <template v-slot:body-cell-actions="props">
      <q-td>
        <div class="q-table__actions">
          <q-btn
            flat
            dense
            round
            icon="visibility"
            :to="`/grupos/${props.row.id}`"
          />
          <q-btn
            flat
            dense
            round
            icon="edit"
            :to="`/grupos/${props.row.id}/editar`"
          />
        </div>
      </q-td>
    </template>

    <template v-slot:no-data>
      <div class="full-width row flex-center q-py-lg">
        <q-icon
          size="3em"
          name="sym_o_info"
          class="q-pr-md"
        />
        <div>
          <h6 class="q-my-none">Sin grupos</h6>
          <div>
            <span> No hay resultados para mostrar. </span>
          </div>
        </div>
      </div>
    </template>
  </q-table>
</template>

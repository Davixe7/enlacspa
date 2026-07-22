<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'
import { money } from 'src/utils/filters'
import ProgramForm from 'src/components/ProgramForm.vue'

const row = ref({ name: '', price: 0, is_active: 1 })
const rows = ref([])
const columns = ref([
  { align: 'left', name: 'order', label: '#', field: 'order' },
  { align: 'left', name: 'name', label: 'Nombre del programa', field: 'name' },
  { align: 'left', name: 'price', label: 'Precio Vigente', field: (row) => money(row.price) },
  {
    align: 'left',
    name: 'valid_since',
    label: 'Vigente desde',
    field: (row) => {
      if (!row.valid_since) return 'N/A'
      // Formateamos para mostrar DD/MM/YYYY
      const dateOnly = row.valid_since.split('T')[0]
      const [year, month, day] = dateOnly.split('-')
      return `${day}/${month}/${year}`
    }
  },
  {
    align: 'right',
    name: 'status',
    label: 'Estatus',
    field: (row) => (row.is_active ? 'Activo' : 'Inactivo')
  },
  { align: 'right', name: 'actions', label: 'Acciones' }
])

function onCreated(program) {
  rows.value.unshift(program)
  dialog.value = false
}

function onUpdated(program) {
  const index = rows.value.findIndex((p) => p.id === program.id)
  if (index !== -1) rows.value[index] = program
  dialog.value = false
}

const dialog = ref(false)

function editProgram(newRow) {
  const data = { ...newRow }

  // Limpiamos la fecha
  if (data.valid_since) {
    data.valid_since = data.valid_since.split('T')[0]
  }

  // FORZAR A ENTERO: Esto evita el estado indeterminado
  data.is_active = data.is_active ? 1 : 0

  row.value = data

  dialog.value = true
}

function addProgram() {
  row.value = {
    id: null,
    name: '',
    price: 0,
    is_active: 1
  }
  dialog.value = true
}

onMounted(async () => {
  rows.value = (await api.get(`/admin/programs`)).data.data
})
</script>

<template>
  <div class="flex items-center q-mb-lg">
    <h1 class="page-title q-mb-none">Programas</h1>
    <q-btn
      class="q-ml-auto"
      icon="sym_o_add"
      @click="addProgram"
      color="primary"
      label="Agregar programa"
    />
  </div>

  <q-table
    :columns="columns"
    :rows="rows"
    :pagination="{ rowsPerPage: 0 }"
  >
    <template v-slot:body-cell-actions="props">
      <q-td class="flex justify-end">
        <q-btn
          icon="sym_o_edit"
          round
          flat
          @click="editProgram(props.row)"
        />
      </q-td>
    </template>
  </q-table>

  <q-dialog v-model="dialog">
    <ProgramForm
      v-model="row"
      @updated="onUpdated"
      @created="onCreated"
      @close="dialog = false"
    />
  </q-dialog>
</template>

<style lang="scss">
.q-field--labeled .q-field__prefix {
  padding-top: 8px;
}
.program-form {
  td:first-child {
    padding-left: 0;
  }
}
</style>

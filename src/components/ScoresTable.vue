<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  mode: { type: String, default: 'user' },
  loading: { type: Boolean, default: false },
  disable: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) },
  categoryId: { type: [String, Number], default: null }
})

const infoDialog = ref(false)
const selectedRow = ref(null)

const openInfo = (row) => {
  selectedRow.value = row
  infoDialog.value = true
}

const columns = computed(() => {
  // Columnas fijas sin metas
  const baseCols = [
    {
      align: 'left',
      name: 'name',
      label: props.mode == 'user' ? 'Actividad' : 'Beneficiario',
      field: (row) => (props.mode == 'user' ? row.activity.name : row.candidate.name)
    },
    { align: 'left', name: 'goal_type', label: 'Tipo', field: (row) => row.activity.goal_type }
  ]

  // Agregar Dato Real siempre
  baseCols.push({ align: 'left', name: 'qualify', label: 'Dato Real' })

  // Solo mostrar Detalles si NO es Académico (ID 2)
  if (String(props.categoryId) !== '2') {
    baseCols.push({ align: 'center', name: 'info', label: 'Detalles' })
  }

  // Agregar Comentario siempre
  baseCols.push({ align: 'left', name: 'comments', label: 'Comentario' })

  return baseCols
})
</script>

<template>
  <q-table
    bordered
    flat
    :loading="loading"
    :columns="columns"
    :rows="rows"
    :pagination="{ rowsPerPage: 0 }"
    no-data-label="NO HAY RESULTADOS PARA MOSTRAR"
  >
    <!-- Slot Dato Real -->
    <template v-slot:body-cell-qualify="props">
      <q-td :props="props">
        <q-input
          v-if="props.row.activity.goal_type != 'Dominio'"
          :disable="disable || props.row.closed == 1"
          type="number"
          borderless
          filled
          v-model="props.row.score"
          style="max-width: 125px"
        />
        <q-select
          v-else
          :disable="disable || props.row.closed == 1"
          dense
          outlined
          :options="[
            { color: 'text-black', label: 'Ninguno', value: 'ninguno' },
            { color: 'text-red', label: 'Presentada', value: 'presentada' },
            { color: 'text-orange', label: 'En proceso', value: 'en proceso' },
            { color: 'text-green', label: 'Dominada', value: 'dominada' }
          ]"
          v-model="props.row.score"
          emit-value
          map-options
          style="max-width: 125px"
        />
      </q-td>
    </template>

    <!-- Slot Comentarios (Verificado para permitir escritura) -->
    <template v-slot:body-cell-comments="props">
      <q-td :props="props">
        <q-input
          v-model="props.row.comments"
          dense
          outlined
          :disable="disable || props.row.closed == 1"
          placeholder="Añadir comentario..."
        />
      </q-td>
    </template>

    <!-- Slot Info -->
    <template v-slot:body-cell-info="props">
      <q-td :props="props">
        <q-btn
          flat
          round
          dense
          color="warning"
          icon="sym_o_priority_high"
          @click="openInfo(props.row)"
        />
      </q-td>
    </template>
  </q-table>
</template>

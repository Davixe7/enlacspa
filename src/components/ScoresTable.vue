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

  // Solo mostrar Metas y Detalles si NO es Académico (ID 2)
  if (String(props.categoryId) !== '2') {
    baseCols.push({
      align: 'center',
      name: 'daily_goal',
      label: 'Meta Diaria',
      field: (row) => row.activity.daily_goal || '-'
    })
    baseCols.push({
      align: 'center',
      name: 'final_goal',
      label: 'Meta Final',
      field: (row) => row.activity.final_goal || '-'
    })
    baseCols.push({ align: 'center', name: 'info', label: 'Detalles' })
  }

  // Agregar Comentario siempre
  baseCols.push({ align: 'left', name: 'comments', label: 'Comentarios' })

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
            { color: 'text-red', label: 'Ninguno', value: 'ninguno' },
            { color: 'text-orange', label: 'Presentada', value: 'presentada' },
            { color: 'text-orange', label: 'En proceso', value: 'en proceso' },
            { color: 'text-green', label: 'Dominada', value: 'dominada' }
          ]"
          v-model="props.row.score"
          emit-value
          map-options
          style="max-width: 140px"
        >
          <!-- Slot para aplicar el color al texto seleccionado -->
          <template v-slot:selected-item="scope">
            <span :class="scope.opt.color">
              {{ scope.opt.label }}
            </span>
          </template>

          <!-- Slot para aplicar el color en el menú desplegable -->
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label :class="scope.opt.color">{{ scope.opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
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
  <q-dialog v-model="infoDialog">
    <q-card style="width: 500px">
      <q-card-section class="text-h6">Detalles de la Actividad</q-card-section>
      <q-card-section v-if="selectedRow">
        <p><strong>Actividad:</strong> {{ selectedRow.activity.name }}</p>
        <p><strong>Intensidad:</strong> {{ selectedRow.activity.intensity }}</p>
        <p><strong>Frecuencia:</strong> {{ selectedRow.activity.frequency }}</p>
        <p><strong>Duración:</strong> {{ selectedRow.activity.duration }}</p>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cerrar"
          color="primary"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

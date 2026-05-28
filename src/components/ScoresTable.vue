<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  mode: { type: String, default: 'user' },
  loading: { type: Boolean, default: false },
  disable: { type: Boolean, default: false },
  errors: { type: Object, default: () => ({}) }
})

const infoDialog = ref(false)
const selectedRow = ref(null)

const openInfo = (row) => {
  selectedRow.value = row
  infoDialog.value = true
}

const columns = computed(() => [
  {
    align: 'left',
    name: 'name',
    label: props.mode == 'user' ? 'Actividad' : 'Beneficiario',
    field: (row) => (props.mode == 'user' ? row.activity.name : row.candidate.name)
  },
  { align: 'left', name: 'goal_type', label: 'Tipo', field: (row) => row.activity.goal_type },
  {
    align: 'left',
    name: 'daily_goal',
    label: 'Meta diaria',
    field: (row) => row.activity.daily_goal
  },
  {
    align: 'left',
    name: 'final_goal',
    label: 'Meta final',
    field: (row) => row.activity.final_goal
  },
  { align: 'left', name: 'qualify', label: 'Dato Real' },
  { align: 'center', name: 'info', label: 'Detalles' },
  { align: 'left', name: 'comments', label: 'Comentario' }
])
</script>

<template>
  <div>
    <!-- Modal de Información -->
    <q-dialog v-model="infoDialog">
      <q-card style="width: 400px">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">Detalles de Actividad</div>
          <q-space />
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
          />
        </q-card-section>

        <q-card-section class="q-gutter-y-sm">
          <div><strong>Intensidad:</strong> {{ selectedRow?.activity.intensity || 'N/A' }}</div>
          <div><strong>Frecuencia:</strong> {{ selectedRow?.activity.frequency || 'N/A' }}</div>
          <div><strong>Duración:</strong> {{ selectedRow?.activity.duration || 'N/A' }}</div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Tabla dentro del flujo normal (se ajustará al ancho de su contenedor padre) -->
    <q-table
      bordered
      flat
      :loading="loading"
      :columns="columns"
      :rows="rows"
      :pagination="{ rowsPerPage: 0 }"
      no-data-label="NO HAY RESULTADOS PARA MOSTRAR"
    >
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
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  readonly: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  mode: { type: String, default: 'user' },
  rows: { type: Array, default: () => [] }
})

const columns = computed(() => {
  return props.mode == 'user'
    ? [
        { align: 'left', name: 'name', label: 'Actividad', field: (row) => row.activity.name },
        { align: 'left', name: 'goal_type', label: 'Tipo', field: (row) => row.activity.goal_type },
        { align: 'left', name: 'qualify', label: 'Calificar' }
      ]
    : [
        { align: 'left', name: 'name', label: 'Beneficiario', field: (row) => row.candidate?.name },
        { align: 'left', name: 'goal_type', label: 'Tipo', field: (row) => row.activity.goal_type },
        { align: 'left', name: 'qualify', label: 'Calificar' }
      ]
})
</script>

<template>
  <q-table
    bordered
    flat
    dense
    :loading="loading"
    :columns="columns"
    :rows="rows"
    :pagination="{ rowsPerPage: 0 }"
    class="q-mb-md activity-candidates-table"
    style="width: 100%"
    no-data-label="NO HAY RESULTADOS PARA MOSTRAR"
  >
    <template v-slot:body-cell-name="props">
      <q-td>
        <div class="multi-line-ellipsis">
          {{ props.value }}
          <q-tooltip
            anchor="top middle"
            self="bottom middle"
            max-width="300px"
            class="bg-dark text-white shadow-4"
          >
            {{ props.value }}
          </q-tooltip>
        </div>
      </q-td>
    </template>

    <template v-slot:body-cell-qualify="props">
      <q-td>
        <q-input
          v-if="props.row.activity.goal_type != 'Dominio'"
          :disable="readonly"
          type="number"
          borderless
          filled
          v-model="rows[props.rowIndex].score"
        >
          <template v-slot:append>
            <div style="font-size: 14px">
              {{ props.row.activity.measurement_unit }}
            </div>
          </template>
        </q-input>
        <q-select
          v-else
          :disable="readonly"
          filled
          dense
          borderless
          :options="[
            { label: 'Presentada', value: 'presentada' },
            { label: 'Dominada', value: 'dominada' },
            { label: 'En proceso', value: 'en proceso' },
            { label: 'Ninguno', value: 'presentaninguno' }
          ]"
          v-model="rows[props.rowIndex].score"
          option-value="value"
          option-label="label"
          emit-value
          map-options
        />
      </q-td>
    </template>
  </q-table>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  readonly: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  mode: { type: String, default: 'user' },
  errors: {type: Object, default: ()=>({})}
})

const rows = defineModel('rows', { type: Array, default: () => [] })

const columns = computed(() => {
  return props.mode == 'user'
    ? [
        { align: 'left', name: 'name', label: 'Actividad', field: (row) => row.activity.name },
        { align: 'left', name: 'goal_type', label: 'Tipo', field: (row) => row.activity.goal_type },
        { align: 'left', name: 'final_goal', label: 'Meta final', field: row => row.activity.final_goal },
        { align: 'left', name: 'qualify', label: 'Dato Real' },
        { align: 'left', name: 'comments', label: 'Comentario'},
      ]
    : [
        { align: 'left', name: 'name', label: 'Beneficiario', field: (row) => row.candidate.name },
        { align: 'left', name: 'goal_type', label: 'Tipo', field: (row) => row.activity.goal_type },
        { align: 'left', name: 'final_goal', label: 'Meta final', field: row => row.activity.final_goal },
        { align: 'left', name: 'qualify', label: 'Dato Real' },
        { align: 'left', name: 'comments', label: 'Comentario'},
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
          :disable="readonly || props.row.closed == 1"
          type="number"
          borderless
          filled
          v-model="rows[props.rowIndex].score"
          style="max-width: 125px"
          :error="errors && !!errors[`scores.${props.rowIndex}.score`]"
          :error-message="'Complete el campo'"
        >
          <template v-slot:append>
            <div style="font-size: 14px">
              {{ props.row.activity.measurement_unit }}
            </div>
          </template>
        </q-input>
        <q-select
          v-else
          :disable="readonly || props.row.closed == 1"
          dense
          outlined
          :options="[
            { color: 'text-black', label: 'Ninguno', value: 'presentaninguno' },
            { color: 'text-red', label: 'Presentada', value: 'presentada' },
            { color: 'text-orange', label: 'En proceso', value: 'en proceso' },
            { color: 'text-green', label: 'Dominada', value: 'dominada' }
          ]"
          v-model="rows[props.rowIndex].score"
          option-value="value"
          option-label="label"
          emit-value
          map-options
          use-chips
          style="max-width: 125px"
        >
        <template v-slot:selected-item="scope">
          <div :class="scope.opt.color" class="q-py-xs">
            {{ scope.opt.label }}
          </div>
        </template>

        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label class="text-weight-bold" :class="scope.opt.color">
                {{ scope.opt.label }}
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      </q-td>
    </template>
  </q-table>
</template>

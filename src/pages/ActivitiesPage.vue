<script setup>
import { api } from 'src/boot/axios'
import { computed, onMounted, ref } from 'vue'
import notify from 'src/utils/notify'

const data = ref({
  id: null,
  plan_category_id: '',
  name: '',
  measurement_unit: '',
  goal_type: ''
})
const loading = ref(true)
const dialog = ref(false)
const searchFilter = ref({
  planCategory: null,
  text: ''
})
const categories = ref([])
const baseCategories = computed(() => categories.value.filter((cat) => cat.parent_id == null))

const measurementUnits = ref([
  { label: 'Cantidad', value: 'cantidad' },
  { label: 'Metros', value: 'metros' },
  { label: 'Minutos', value: 'minutos' },
  { label: 'Horas', value: 'horas' },
  { label: 'Sí / No', value: 'si_no' },
  { label: 'Mixta', value: 'mixta' }
])

const goalTypes = ref([
  { label: 'Normal', value: 'Normal' },
  { label: 'Incremental', value: 'Incremental' },
  { label: 'Acumulada', value: 'Acumulada' },
  { label: 'Dominio', value: 'Dominio' }
])

const columns = ref([
  {
    align: 'left',
    name: 'plan',
    label: 'Plan',
    field: (row) => row.plan_category.label,
    sortable: true
  },
  { align: 'left', name: 'name', label: 'Actividad', field: 'name', sortable: true },
  { align: 'left', name: 'measurement_unit', label: 'Unidad', field: 'measurement_unit' },
  { align: 'left', name: 'goal_type', label: 'Meta', field: 'goal_type', sortable: true },
  { align: 'right', name: 'actions', label: 'Acciones', sortable: false }
])

const rows = ref([])

const results = computed(() => {
  if (searchFilter.value.planCategory == null) {
    return [...rows.value]
  }
  return rows.value.filter((row) => row.plan_category_id == searchFilter.value.planCategory)
})

async function fetchActivities() {
  try {
    loading.value = true
    rows.value = (await api.get('activities')).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    loading.value = true
    categories.value = (await api.get('plan_categories')).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function save() {
  try {
    loading.value = true
    let route = data.value.id ? `activities/${data.value.id}` : 'activities'
    let payload = data.value.id ? { ...data.value, _method: 'PUT' } : { ...data.value }
    let response = (await api.post(route, payload)).data.data
    let action = 'registrada'
    if (data.value.id) {
      action = 'actualizada'
      rows.value.splice(rows.value.indexOf(data.value), 1, response)
    } else {
      rows.value.push(response)
    }
    notify.positive(`Actividad ${action} exitosamente`)
    dialog.value = false
  } catch (error) {
    notify.negative('Error al guardar los cambios')
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchActivities()
  fetchCategories()
})
</script>

<template>
  <div class="page-title">Catálogo de Actividades</div>
  <div class="row q-col-gutter-x-md q-my-md">
    <div class="col-md-3">
      <q-select
        outlined
        stack-label
        label="Plan"
        v-model="searchFilter.planCategory"
        :options="baseCategories"
        option-value="id"
        option-label="label"
        emit-value
        map-options
      />
    </div>
    <div class="col-md-3">
      <q-input
        outlined
        type="search"
        label="Actividad"
        v-model="searchFilter.text"
      >
        <template v-slot:append>
          <q-icon name="sym_o_search" />
        </template>
      </q-input>
    </div>
    <div class="col-md-3"></div>
    <div class="col-md-3 flex justify-end">
      <q-btn
        style="flex: 0 0 auto; align-self: end"
        color="primary"
        label="Nueva actividad"
        icon="sym_o_add"
        @click="
          () => {
            dialog = true
            data = {}
          }
        "
      />
    </div>
  </div>

  <div class="activities">
    <q-table
      flat
      bordered
      :pagination="{ rowsPerPage: 0 }"
      :columns="columns"
      :rows="results"
      :filter="searchFilter.text"
      class="activities-table"
    >
      <template v-slot:body-cell-actions="props">
        <q-td>
          <div class="q-table__actions">
            <q-btn
              flat
              round
              dense
              icon="sym_o_edit"
              @click="
                () => {
                  data = props.row
                  dialog = true
                }
              "
            />
            <!-- <q-btn
            flat
            round
            dense
            icon="sym_o_delete"
          /> -->
          </div>
        </q-td>
      </template>
    </q-table>
  </div>

  <q-dialog v-model="dialog">
    <q-card style="width: 420px">
      <div class="q-px-md">
        <h3 class="page-subtitle">Nueva Actividad</h3>
      </div>
      <q-markup-table flat>
        <tbody>
          <tr>
            <td>Plan</td>
            <td>
              <q-select
                dense
                outlined
                v-model="data.plan_category_id"
                :options="baseCategories"
                emit-value
                map-options
                option-value="id"
                option-label="label"
              />
            </td>
          </tr>
          <tr>
            <td>Nombre</td>
            <td>
              <q-input
                outlined
                stack-label
                v-model="data.name"
              />
            </td>
          </tr>
          <tr>
            <td>Unidad de medida</td>
            <td>
              <q-select
                dense
                outlined
                v-model="data.measurement_unit"
                :options="measurementUnits"
                emit-value
                map-options
              />
            </td>
          </tr>
          <tr>
            <td>Tipo de meta</td>
            <td>
              <q-select
                dense
                outlined
                v-model="data.goal_type"
                :options="goalTypes"
                emit-value
                map-options
              />
            </td>
          </tr>
        </tbody>
      </q-markup-table>
      <q-card-section class="flex justify-end">
        <q-btn
          @click="save"
          color="primary"
          label="Guardar"
          :loading="loading"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss">
table.activities-table td:nth-child(2),
.activities table td:nth-child(2) {
  max-width: 250px;
  white-space: wrap;
  padding-right: 2rem;
}
</style>

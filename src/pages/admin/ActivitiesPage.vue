<script setup>
import { api } from 'src/boot/axios'
import { computed, onMounted, ref } from 'vue'
import notify from 'src/utils/notify'

const data = ref({
  id: null,
  plan_category_id: '',
  activity_category_id: '',
  name: '',
  measurement_unit: '',
  goal_type: ''
})
const loading = ref(true)
const dialog = ref(false)
const searchFilter = ref({
  planCategory: 1,
  activityCategory: null,
  text: ''
})

const subcategories = ref([])
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
  {
    align: 'left',
    name: 'activity_category',
    label: 'Clasificacion',
    field: (row) => row.activity_category.label
  },
  { align: 'left', name: 'measurement_unit', label: 'Unidad', field: 'measurement_unit' },
  { align: 'left', name: 'goal_type', label: 'Meta', field: 'goal_type', sortable: true },
  { align: 'right', name: 'actions', label: 'Acciones', sortable: false }
])

const rows = ref([])

const results = computed(() => {
  if (searchFilter.value.planCategory == null) {
    return [...rows.value]
  }
  let results = rows.value.filter((row) => row.plan_category_id == searchFilter.value.planCategory)
  if (searchFilter.value.activityCategory) {
    results = results.filter(
      (row) => row.activity_category_id == searchFilter.value.activityCategory
    )
  }
  return results
})

async function fetchActivities() {
  try {
    let route = `activities/?plan_category_id=${searchFilter.value.planCategory}`

    if (searchFilter.value.activityCategory) {
      route = route + `&activity_category_id=${searchFilter.value.activityCategory}`
    }

    loading.value = true
    rows.value = (await api.get(route)).data.data
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

async function fetchSubcategories(planCategoryId = null) {
  planCategoryId = planCategoryId ?? searchFilter.value.planCategory
  searchFilter.value.activityCategory = null
  data.value.activity_category_id = null

  try {
    loading.value = true
    let results = (await api.get(`activity_categories/?plan_category_id=${planCategoryId}`)).data
      .data
    results.unshift({ label: 'Seleccionar Clasificación', id: null })
    subcategories.value = results
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
  await fetchCategories()
  await fetchSubcategories()
  await fetchActivities()
})
</script>

<template>
  <div class="page-title">Catálogo de Actividades</div>
  <div class="row q-col-gutter-md q-my-md">
    <div class="col-12 col-md-3 col-lg-2">
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
        @update:model-value="
          () => {
            fetchActivities()
            fetchSubcategories()
          }
        "
      />
    </div>
    <div class="col-12 col-md-3 col-lg-2">
      <q-select
        outlined
        stack-label
        label="Clasificación"
        v-model="searchFilter.activityCategory"
        :options="subcategories"
        option-value="id"
        option-label="label"
        emit-value
        map-options
        @update:model-value="
          () => {
            fetchActivities()
          }
        "
      />
    </div>
    <div class="col-12 col-md-3 col-lg-2">
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
    <div class="col-12 col-md flex justify-end">
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
      :pagination="{ rowsPerPage: 100 }"
      :columns="columns"
      :rows="results"
      :filter="searchFilter.text"
      :loading="loading"
      class="activities-table"
    >
      <template v-slot:loading>
        <div class="flex q-my-lg justify-center">
          <div>
            <q-spinner
              size="30px"
              color="primary"
              class="q-mr-md"
            ></q-spinner>
            Cargando...
          </div>
        </div>
      </template>
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
                @update:model-value="fetchSubcategories(data.plan_category_id)"
              />
            </td>
          </tr>
          <tr>
            <td>Clasificación</td>
            <td>
              <q-select
                dense
                outlined
                v-model="data.activity_category_id"
                :options="subcategories"
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
  line-break: anywhere;
  padding-right: 2rem;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>

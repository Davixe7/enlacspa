<script setup>
import { api } from 'src/boot/axios'
import { computed, ref, onMounted, watch } from 'vue'

const props = defineProps(['categoryId', 'category'])
const model = defineModel()
const showList = ref(false)
const loading = ref(false)

watch(
  () => props.categoryId,
  (newVal) => {
    console.log(newVal)
    fetchActivities()
    fetchSubcategories()
  }
)

const searchFilter = ref({
  query: '',
  subcategoryId: null
})

const subcategories = ref([])
const activities = ref([])
const results = computed(() => {
  let results = activities.value

  if (searchFilter.value.subcategoryId) {
    results = results.filter(
      (activity) => activity.activity_category_id == searchFilter.value.subcategoryId
    )
  }

  if (searchFilter.value.query) {
    results = results.filter((activity) =>
      String(activity.name).toLowerCase().includes(searchFilter.value.toLowerCase())
    )
  }

  if (model.value.length) {
    results = results.filter(
      (resultItem) => !model.value.find((planActivity) => planActivity.id == resultItem.id)
    )
  }

  return results
})

async function fetchSubcategories() {
  try {
    loading.value = true
    let route = 'activity_categories'
    let params = { plan_category_id: props.categoryId }
    let results = (await api.get(route, params)).data.data
    results.unshift({ label: 'Clasificación', id: null })
    subcategories.value = results
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function fetchActivities() {
  try {
    loading.value = true
    let route = `activities/?plan_category_id=${props.categoryId}`
    activities.value = (await api.get(route)).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

const draggedItem = ref(null)

function onDragStart(activity) {
  console.log('Start dragging')
  draggedItem.value = activity
}

function onDrop() {
  console.log('Drop')
  if (!draggedItem.value) return
  model.value.push({ ...draggedItem.value, daily_goal: null })
}

function removeActivity(activity) {
  if (!window.confirm('Seguro que desea descartar la actividad?')) return
  model.value.splice(model.value.indexOf(activity), 1)
}

const selectedActivity = ref(null)
const dialog = ref(false)

function setActivity(activity) {
  selectedActivity.value = activity
  dialog.value = true
}

const instructables = ['fisico', 'natacion', 'gimnasia', 'equinoterapia']

onMounted(() => {
  fetchActivities()
  fetchSubcategories()
})
</script>

<template>
  <q-dialog v-model="dialog">
    <q-card style="width: 400px">
      <q-card-section>
        <div class="flex justify-between">
          <div class="page-subtitle q-mb-md">Ajustes de la actividad</div>
          <q-btn
            flat
            round
            dense
            icon="sym_o_close"
            style="align-self: flex-start; flex: 0 0"
            @click="dialog = false"
          />
        </div>
      </q-card-section>

      <div class="q-px-md q-pb-md">
        <q-input
          outlined
          stack-label
          hide-bottom-space
          v-model="selectedActivity.name"
          label="Actividad"
          :readonly="true"
        />
      </div>

      <q-markup-table>
        <tbody>
          <tr>
            <td>Intensidad</td>
            <td>
              <q-input
                outlined
                stack-label
                hide-bottom-space
                v-model="selectedActivity.intensity"
              />
            </td>
          </tr>
          <tr>
            <td>Frencuencia</td>
            <td>
              <q-input
                outlined
                stack-label
                hide-bottom-space
                v-model="selectedActivity.frequency"
              />
            </td>
          </tr>
          <tr>
            <td>Duración</td>
            <td>
              <q-input
                outlined
                stack-label
                hide-bottom-space
                v-model="selectedActivity.duration"
              />
            </td>
          </tr>
        </tbody>
      </q-markup-table>

      <div class="flex justify-end q-pa-md">
        <q-btn
          color="primary"
          label="Guardar"
          :loading="loading"
          type="submit"
          @click="dialog = false"
        />
      </div>
    </q-card>
  </q-dialog>

  <div class="page-title flex items-center q-mb-lg">
    <q-btn
      icon="sym_o_menu"
      flat
      round
      dense
      style="flex: 0 0; font-size: 1rem; align-self: flex-start"
      @click="showList = !showList"
      class="q-mr-md"
    />
    Detalles del plan individual
  </div>

  <div class="row q-col-gutter-x-md">
    <div
      class="col-md-4"
      v-show="showList"
    >
      <div
        class="flex q-gutter-x-md"
        style="flex-flow: row nowrap"
      >
        <q-input
          outlined
          stack-label
          hide-bottom-space
          v-model="searchFilter.query"
          class="q-mb-md"
          clearable
          style="width: 100%"
        >
          <template v-slot:prepend>
            <q-icon name="sym_o_search" />
          </template>
        </q-input>

        <q-select
          outlined
          stack-label
          v-model="searchFilter.subcategoryId"
          :options="subcategories"
          option-value="id"
          option-label="label"
          emit-value
          map-options
          dense
          style="width: fit-content; white-space: nowrap"
        />
      </div>

      <q-list
        separator
        bordered
        class="activity-list"
      >
        <q-item
          draggable="true"
          @dragstart="onDragStart(item)"
          v-for="item in results"
          :key="item.id"
        >
          <q-item-section>{{ item.name }}</q-item-section>
        </q-item>
      </q-list>
    </div>

    <div
      class="col-12 col-md"
      @drop="onDrop"
      @dragover.prevent=""
      style="min-height: calc(100vh - 264px); transition: all 0.4s"
    >
      <q-markup-table
        flat
        bordered
        class="plan-form-table"
      >
        <thead>
          <tr>
            <th>Nombre</th>
            <th style="white-space: nowrap">Tipo de Meta</th>
            <th>Unidad</th>
            <th>Meta diaria</th>
            <th>Meta final</th>
            <th></th>
          </tr>
        </thead>
        <template v-if="model.length">
          <tbody>
            <tr
              v-for="activity in model"
              :key="activity.id"
            >
              <td class="td--name">{{ activity.name }}</td>
              <td>{{ activity.goal_type }}</td>
              <td class="td--measurement-unit">
                {{ activity.measurement_unit }}
              </td>
              <td>
                <q-input
                  dense
                  outlined
                  stack-label
                  hide-bottom-space
                  v-model="activity.daily_goal"
                  v-if="activity.goal_type == 'Normal'"
                />
                <template v-else-if="activity.goal_type == 'Dominio'">Dominada</template>
                <template v-else>N/A</template>
              </td>
              <td>
                <q-input
                  dense
                  outlined
                  stack-label
                  hide-bottom-space
                  v-if="['Incremental', 'Acumulada'].includes(activity.goal_type)"
                  v-model="activity.final_goal"
                />
              </td>
              <td>
                <q-btn
                  flat
                  round
                  dense
                  icon="sym_o_delete"
                  @click="removeActivity(activity)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="sym_o_info"
                  @click="setActivity(activity)"
                  :disable="!instructables.includes(category.name)"
                />
              </td>
            </tr>
          </tbody>
        </template>
        <template v-else>
          <tr>
            <td
              colspan="6"
              class="program-activities--empty"
            >
              Arrastra actividades aqui para armar el plan
            </td>
          </tr>
        </template>
      </q-markup-table>
    </div>
  </div>
</template>

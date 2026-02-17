<script setup>
import { api } from 'src/boot/axios'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import notify from 'src/utils/notify'

const errors = ref({})
const router = useRouter()
const props = defineProps(['planId', 'groupId', 'candidateId'])
const loading = ref(false)
const activitiesSearch = ref('')
const categoriesResource = ref([])

const categories = computed(() =>
  categoriesResource.value.filter((category) => category.parent_id == null)
)

const subcategories = computed(() =>
  program.value.category_id
    ? categoriesResource.value.filter((category) => category.parent_id == program.value.category_id)
    : []
)

const activitiesResource = ref([])
const activities = computed(() => {
  let results = activitiesResource.value.filter(
    (activity) =>
      !program.value.activities.find((programActivity) => programActivity.id == activity.id)
  )

  if (activitiesSearch.value == '' || activitiesSearch.value == null) {
    return results
  }

  return results.filter((activity) =>
    String(activity.name).toLowerCase().includes(activitiesSearch.value.toLowerCase())
  )
})

const program = ref({
  id: null,
  group_id: props.groupId,
  candidate_id: props.candidateId,
  category_id: null,
  subcategory_id: null,
  name: '',
  status: false,
  start_date: null,
  end_date: null,
  activities: []
})

async function fetchProgram() {
  if (!props.planId) return
  try {
    loading.value = true
    program.value = (await api.get(`plans/${props.planId}`)).data.data
    fetchActivities()
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function fetchPlanCategories(parentId) {
  try {
    loading.value = true
    let route = parentId ? `plan_categories/?parent_id=${parentId}` : `plan_categories`
    categoriesResource.value = (await api.get(route)).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function fetchActivities() {
  try {
    loading.value = true
    let route = `activities/?plan_category_id=${program.value.category_id}`
    activitiesResource.value = (await api.get(route)).data.data
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
  program.value.activities.push({ ...draggedItem.value, daily_goal: null })
}

function removeActivity(activity) {
  if (!window.confirm('Seguro que desea descartar la actividad?')) return
  program.value.activities.splice(program.value.activities.indexOf(activity), 1)
}

function formatActivities() {
  return program.value.activities.reduce((acc, actividad) => {
    acc[actividad.id] = { daily_goal: actividad.daily_goal, final_goal: actividad.final_goal }
    return acc
  }, {})
}

const redirectTo = computed(() =>
  props.candidateId
    ? { name: 'programs.index', props: { candidateId: props.candidateId } }
    : { name: 'groups.show', props: { groupId: props.groupId ?? program.value.group_id } }
)

async function saveProgram() {
  try {
    loading.value = true
    let data = {
      ...program.value,
      activities: formatActivities(),
      _method: props.planId ? 'PUT' : 'POST'
    }
    let route = props.planId ? `plans/${props.planId}` : 'plans'
    let result = (await api.post(route, data)).data.data
    notify.positive('Programa guardado exitosamente.')
    router.push({ ...redirectTo, params: { recent: result.id } })
  } catch (error) {
    errors.value = error.response.status == '422' ? error.formatted : errors.value
    notify.negative('No se pudo registrar el programa.')
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchPlanCategories()
  await fetchProgram()
})
</script>

<template>
  <div class="row">
    <div class="col-12">
      <div class="flex items-center">
        <div class="page-title">
          Elaborar Programa {{ props.candidateId ? 'Individual' : 'Grupal' }}
        </div>
      </div>

      <div class="row q-col-gutter-x-md q-mb-lg">
        <div class="col-md-2">
          <q-select class="q-field--required" outlined stack-label hide-bottom-space label="Plan" :options="categories"
            map-options emit-value option-value="id" v-model="program.category_id"
            @update:model-value="fetchActivities()" :error="!!(errors && errors.category_id)"
            :error-message="errors.category_id" />
        </div>

        <div class="col-md-4">
          <q-select class="q-field--required" outlined stack-label hide-bottom-space label="Tipo de plan"
            :options="subcategories" map-options emit-value option-value="id" option-label="name"
            v-model="program.subcategory_id" :error="!!(errors && errors.subcategory_id)"
            :error-message="errors.subcategory_id" />
        </div>

        <div class="col-md-4">
          <q-input class="q-field--required" label="Nombre del plan" outlined stack-label hide-bottom-space
            v-model="program.name" :error="!!(errors && errors.name)" :error-message="errors.name" />
        </div>
        <div class="col-md-2 flex">
          <q-toggle style="align-self: flex-end" :label="program.status ? 'Activo' : 'Inactivo'" outlined stack-label
            hide-bottom-space v-model="program.status" :true-value="1" :false-value="0" />
        </div>
      </div>

      <div class="row q-col-gutter-x-md q-mb-lg">
        <div class="col-md-2">
          <q-input outlined stack-label v-model="program.start_date" class="q-field--required" label="Fecha de inicio"
            mask="##/##/####" :error="!!(errors && errors.start_date)" :error-message="errors.start_date">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="program.start_date" mask="DD/MM/YYYY" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>

        <div class="col-md-2">
          <q-input outlined stack-label v-model="program.end_date" class="q-field--required" label="Fecha de cierre"
            mask="##/##/####" :error="!!(errors && errors.end_date)" :error-message="errors.end_date">
            <template v-slot:append>
              <q-icon name="event" class="cursor-pointer">
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="program.end_date" mask="DD/MM/YYYY" />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
        </div>
      </div>

      <div class="page-subtitle q-mb-md">Detalles del plan individual</div>

      <div class="row q-col-gutter-x-md">
        <div class="col-md-4">
          <q-input outlined stack-label hide-bottom-space v-model="activitiesSearch" class="q-mb-md" clearable>
            <template v-slot:prepend>
              <q-icon name="sym_o_search" />
            </template>
          </q-input>

          <q-list separator bordered>
            <q-item draggable="true" @dragstart="onDragStart(item)" v-for="item in activities" :key="item.id">
              <q-item-section>{{ item.name }}</q-item-section>
            </q-item>
          </q-list>
        </div>

        <div class="col-md-8" @drop="onDrop" @dragover.prevent="">
          <q-markup-table flat bordered class="plan-form-table">
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
            <template v-if="program.activities.length">
              <tbody>
                <tr v-for="activity in program.activities" :key="activity.id">
                  <td class="td--name">{{ activity.name }}</td>
                  <td>{{ activity.goal_type }}</td>
                  <td class="td--measurement-unit">
                    {{ activity.measurement_unit }}
                  </td>
                  <td>
                    <q-input dense outlined stack-label hide-bottom-space v-model="activity.daily_goal"
                      v-if="activity.goal_type == 'Normal'" />
                    <template v-else>N/A</template>
                  </td>
                  <td>
                    <q-input dense outlined stack-label hide-bottom-space
                      v-if="['Incremental', 'Acumulada'].includes(activity.goal_type)" v-model="activity.final_goal" />
                  </td>
                  <td>
                    <q-btn flat round dense icon="sym_o_delete" @click="removeActivity(activity)" />
                  </td>
                </tr>
              </tbody>
            </template>
            <template v-else>
              <tr>
                <td colspan="6" class="program-activities--empty">
                  Arrastra actividades aqui para armar el plan
                </td>
              </tr>
            </template>
          </q-markup-table>

          <div class="flex justify-end q-py-lg">
            <q-btn color="primary" label="Guardar programa" :loading="loading" @click="saveProgram" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.td--name {
  max-width: 560px;
  white-space: pre-wrap !important;
}

.td--measurement-unit {
  max-width: 100px;
  white-space: wrap;
  overflow: hidden;
}

.program-activities--empty {
  border: 2px $primary dashed !important;
  text-align: center !important;
  padding: 13px 16px !important;
}

.plan-form-table {

  th,
  td {
    text-align: left;
  }
}
</style>

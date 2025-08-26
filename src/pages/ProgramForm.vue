<script setup>
import { api } from 'src/boot/axios'
import { computed, onMounted } from 'vue'
import { ref } from 'vue'

const props = defineProps(['candidateId'])
const loading = ref(false)
const search = ref('')
const planTypes = ref([])
const plans = ref([])
const planOptions = computed(() =>
  plans.value.filter((plan) => plan.plan_type_id == program.value.plan_type_id)
)
const activities = ref([])
const activitiesOptions = computed(() => {
  return activities.value.filter(
    (activity) =>
      !program.value.activities.find((programActivity) => programActivity.id == activity.id)
  )
})

const program = ref({
  id: null,
  candidate_id: props.candidateId,
  plan_id: null,
  plan_type_id: null,
  name: '',
  activities: [],
  status: false
})

async function fetchPlanTypes() {
  try {
    loading.value = true
    planTypes.value = (await api.get(`plan_types`)).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function fetchPlans() {
  try {
    loading.value = true
    plans.value = (await api.get(`plans`)).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function fetchActivities() {
  try {
    loading.value = true
    activities.value = (
      await api.get(`activities/?plan_type_id=${program.value.plan_type_id}`)
    ).data.data
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

async function saveProgram() {
  try {
    loading.value = true
    program.value.activities = program.value.activities.reduce((acc, actividad) => {
      acc[actividad.id] = { daily_goal: actividad.daily_goal }
      return acc
    }, {})
    await api.post(`personal_programs`, { ...program.value })
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPlans()
  fetchPlanTypes()
})
</script>

<template>
  <div class="row">
    <div class="col-12 col-md-10">
      <div class="flex items-center">
        <div class="page-title">Elaborar Programa Individual</div>
      </div>

      <div class="row q-col-gutter-x-md q-mb-lg">
        <div class="col-md-2">
          <q-select
            outlined
            stack-label
            hide-bottom-space
            label="Plan"
            :options="planTypes"
            map-options
            emit-value
            option-value="id"
            v-model="program.plan_type_id"
            @update:model-value="fetchActivities()"
          />
        </div>

        <div class="col-md-4">
          <q-select
            outlined
            stack-label
            hide-bottom-space
            label="Tipo de plan"
            :options="planOptions"
            map-options
            emit-value
            option-value="id"
            option-label="name"
            v-model="program.plan_id"
          />
        </div>

        <div class="col-md-4">
          <q-input
            label="Nombre del plan"
            outlined
            stack-label
            hide-bottom-space
            v-model="program.name"
          />
        </div>
        <div class="col-md-2 flex">
          <q-toggle
            style="align-self: flex-end"
            :label="program.status ? 'Activo' : 'Inactivo'"
            outlined
            stack-label
            hide-bottom-space
            v-model="program.status"
          />
        </div>
      </div>

      <div class="page-subtitle q-mb-md">Detalles del plan individual</div>

      <div class="row q-col-gutter-x-md">
        <div class="col-md-6">
          <q-input
            outlined
            stack-label
            hide-bottom-space
            v-model="search"
            class="q-mb-md"
          >
            <template v-slot:prepend>
              <q-icon name="sym_o_search" />
            </template>
          </q-input>
          <q-list
            separator
            bordered
          >
            <q-item
              draggable="true"
              @dragstart="onDragStart(item)"
              v-for="item in activitiesOptions"
              :key="item.id"
            >
              <q-item-section>{{ item.name }}</q-item-section>
            </q-item>
          </q-list>
        </div>

        <div
          class="col-md-6"
          @drop="onDrop"
          @dragover.prevent=""
        >
          <q-markup-table
            flat
            bordered
          >
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Unidad</th>
                <th style="white-space: nowrap">Tipo de Meta</th>
                <th>Meta diaria</th>
                <th></th>
              </tr>
            </thead>
            <template v-if="program.activities.length">
              <tbody>
                <tr
                  v-for="activity in program.activities"
                  :key="activity.id"
                >
                  <td>{{ activity.name }}</td>
                  <td>{{ activity.measurement_unit }}</td>
                  <td>{{ activity.goal_type }}</td>
                  <td>
                    <q-input
                      dense
                      outlined
                      stack-label
                      hide-bottom-space
                      v-model="activity.daily_goal"
                    ></q-input>
                  </td>
                  <td>
                    <q-btn
                      flat
                      round
                      dense
                      icon="sym_o_delete"
                      @click="removeActivity(activity)"
                    />
                  </td>
                </tr>
              </tbody>
            </template>
            <template v-else>
              <tr>
                <td
                  colspan="4"
                  style="border: 2px blue dashed; text-align: center; padding: 13px 16px"
                >
                  Arrastra actividades aqui para armar el plan
                </td>
              </tr>
            </template>
          </q-markup-table>

          <div class="flex justify-end q-py-lg">
            <q-btn
              color="primary"
              label="Guardar programa"
              :loading="loading"
              @click="saveProgram"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

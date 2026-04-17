<script setup>
import { api } from 'src/boot/axios'
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import notify from 'src/utils/notify'
import EnlacDate from 'src/components/EnlacDate.vue'
import PlanActivities from './PlanActivities.vue'

const errors = ref({})
const router = useRouter()
const props = defineProps(['planId', 'groupId', 'candidateId'])
const loading = ref(false)

const categories = ref([])
const planTypes = ref([])

const category = computed(() => {
  return categories.value.find((cat) => cat.id == plan.value.category_id)
})

const plan = ref({
  id: null,
  group_id: props.groupId,
  candidate_id: props.candidateId,
  category_id: 1,
  plan_type_id: 1,
  name: '',
  status: 1,
  start_date: null,
  end_date: null,
  activities: []
})

async function fetchPlan() {
  if (!props.planId) return
  try {
    loading.value = true
    plan.value = (await api.get(`plans/${props.planId}`)).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function fetchCategories() {
  try {
    loading.value = true
    categories.value = (await api.get(`plan_categories`)).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function fetchPlanTypes() {
  try {
    loading.value = true
    planTypes.value = (
      await api.get(`plan_types/?plan_category_id=${plan.value.category_id}`)
    ).data.data
  } catch (error) {
    notify.negative('Error al cargar los tipos de plan')
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function savePlan() {
  try {
    loading.value = true
    let data = {
      ...plan.value,
      activities: formatActivities(),
      _method: props.planId ? 'PUT' : 'POST'
    }
    let route = props.planId ? `plans/${props.planId}` : 'plans'
    let result = (await api.post(route, data)).data.data
    notify.positive('Programa guardado exitosamente.')
    router.push({ ...redirectTo.value, params: { recent: result.id } })
  } catch (error) {
    errors.value = error.response.status == '422' ? error.formatted : errors.value
    notify.negative('No se pudo registrar el programa.')
    console.log(error)
  } finally {
    loading.value = false
  }
}

function formatActivities() {
  return plan.value.activities.reduce((acc, actividad) => {
    acc[actividad.id] = {
      daily_goal: actividad.daily_goal,
      final_goal: actividad.final_goal ?? null,
      intensity: actividad.intensity,
      frequency: actividad.frequency,
      duration: actividad.duration
    }
    return acc
  }, {})
}

const redirectTo = computed(() =>
  props.candidateId
    ? { name: 'programs.index', props: { candidateId: props.candidateId } }
    : { name: 'groups.show', props: { groupId: props.groupId ?? plan.value.group_id } }
)

onMounted(async () => {
  await fetchCategories()
  await fetchPlan()
  await fetchPlanTypes()
})
</script>

<template>
  <div class="page-title">Elaborar Programa {{ props.candidateId ? 'Individual' : 'Grupal' }}</div>

  <div class="row q-col-gutter-md q-mb-lg">
    <div class="col-12 col-md-4 q-gutter-y-md">
      <q-select
        class="q-field--required"
        outlined
        stack-label
        hide-bottom-space
        label="Plan"
        :options="categories"
        map-options
        emit-value
        option-value="id"
        v-model="plan.category_id"
        @update:model-value="
          () => {
            fetchPlanTypes()
            plan.plan_type_id = null
          }
        "
        :error="!!(errors && errors.category_id)"
        :error-message="errors.category_id"
      />
      <q-select
        class="q-field--required"
        outlined
        stack-label
        hide-bottom-space
        label="Tipo de plan"
        :options="planTypes"
        map-options
        emit-value
        option-value="id"
        option-label="label"
        v-model="plan.plan_type_id"
        :error="!!(errors && errors.plan_type_id)"
        :error-message="errors.plan_type_id"
      />
      <q-input
        class="q-field--required"
        label="Nombre del plan"
        outlined
        stack-label
        hide-bottom-space
        v-model="plan.name"
        :error="!!(errors && errors.name)"
        :error-message="errors.name"
      />
      <div class="row q-col-gutter-x-md">
        <div class="col">
          <enlac-date
            outlined
            label="Fecha de inicio"
            v-model="plan.start_date"
          />
        </div>
        <div class="col">
          <enlac-date
            outlined
            label="Fecha de cierre"
            v-model="plan.end_date"
            :limit-to-past="false"
          />
        </div>
      </div>
      <q-toggle
        style="align-self: flex-end"
        :label="plan.status ? 'Activo' : 'Inactivo'"
        outlined
        stack-label
        hide-bottom-space
        v-model="plan.status"
        :true-value="1"
        :false-value="0"
      />
    </div>
  </div>

  <PlanActivities
    v-model="plan.activities"
    :category="category"
    :categoryId="plan.category_id"
  />

  <div class="flex justify-end q-py-lg">
    <q-btn
      color="primary"
      label="Guardar programa"
      :loading="loading"
      @click="savePlan()"
    />
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

.activity-list {
  height: calc(100vh - 320px);
  overflow: auto;
}
</style>

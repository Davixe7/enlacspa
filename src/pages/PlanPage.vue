<script setup>
import { api } from 'src/boot/axios'
import { ref, onMounted } from 'vue'

const props = defineProps(['planId'])
const loading = ref(false)
const program = ref(null)

async function fetchProgram() {
  try {
    loading.value = true
    program.value = (await api.get(`personal_programs/${props.planId}`)).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchProgram()
})
</script>

<template>
  <div class="flex items-center">
    <div class="page-title">Detalles del Programa</div>
  </div>

  <div
    class="page-subtitle q-mb-lg text-center"
    v-if="program && program.id"
  >
    {{ program.category.label }} <span class="text-grey">/</span> {{ program.plan_type.label }}
    <span class="text-grey">/</span> {{ program.name }}
  </div>

  <div class="row">
    <div class="col-md-10 q-mx-auto">
      <q-markup-table
        flat
        bordered
        v-if="program && program.id"
      >
        <thead>
          <tr>
            <th class="text-left">Actividad</th>
            <th class="text-left">Unidad</th>
            <th class="text-left">Tipo de Meta</th>
            <th class="text-left">Meta diaria</th>
            <th class="text-left">Meta final</th>
            <th class="text-left">Intensidad</th>
            <th class="text-left">Frecuencia</th>
            <th class="text-left">Duración</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="activity in program.activities"
            :key="activity.id"
          >
            <td>{{ activity.name }}</td>
            <td>{{ activity.measurement_unit }}</td>
            <td>{{ activity.goal_type }}</td>
            <td>{{ activity.daily_goal || 'N/A' }}</td>
            <td>{{ (activity.final_goal ?? activity.pivot?.final_goal) || 'N/A' }}</td>
            <td>{{ (activity.intensity ?? activity.pivot?.intensity) || 'N/A' }}</td>
            <td>{{ (activity.frequency ?? activity.pivot?.frequency) || 'N/A' }}</td>
            <td>{{ (activity.duration ?? activity.pivot?.duration) || 'N/A' }}</td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </div>
</template>

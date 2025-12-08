<script setup>
import { api } from 'src/boot/axios'
import { ref, onMounted } from 'vue'

const props = defineProps(['planId'])
const loading = ref(false)
const program = ref({
  activities: []
})

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
    <!--   <q-btn
      outline
      class="q-ml-auto"
      color="primary"
      label="Nuevo"
      icon="sym_o_add"
    /> -->
  </div>

  <div
    class="page-subtitle q-mb-lg text-center"
    v-if="program && program.id"
  >
    {{ program.category.label }} <span class="text-grey">/</span> {{ program.subcategory.label }}
    <span class="text-grey">/</span> {{ program.name }}
  </div>

  <div class="row">
    <div
      class="col-md-10 q-mx-auto"
      @drop="onDrop"
      @dragover.prevent=""
    >
      <q-markup-table
        flat
        bordered
        v-if="program && program.id"
      >
        <thead>
          <tr>
            <th class="text-left">Actividad</th>
            <th class="text-left">Unidad</th>
            <th
              class="text-left"
              style="white-space: nowrap"
            >
              Tipo de Meta
            </th>
            <th class="text-left">Meta diaria</th>
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
            <td>{{ activity.daily_goal }}</td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </div>
</template>

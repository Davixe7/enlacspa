<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'
import notify from 'src/utils/notify'
import ProgramsTable from './ProgramsTable.vue'

const props = defineProps(['groupId'])

const group = ref({})
const loading = ref(false)

async function fetchGroup() {
  try {
    loading.value = true
    group.value = (await api.get(`/groups/${props.groupId}`)).data.data
  } catch (error) {
    console.log(error)
    notify.negative('Error al cargar el grupo')
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchGroup())
</script>

<template>
  <h1 class="page-title">Programación grupo</h1>

  <div class="row items-center">
    <h3 class="page-subtitle">Planes</h3>
    <q-btn
      color="primary"
      label="Agregar plan"
      icon="add"
      class="q-ml-auto"
      :to="`/grupos/${group.id}/planes/crear`"
    />
  </div>

  <ProgramsTable :groupId="groupId" />
</template>

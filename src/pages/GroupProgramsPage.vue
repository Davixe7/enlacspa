<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'
import notify from 'src/utils/notify'
import ProgramsTable from './PlansTable.vue'

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
  <h1 class="page-title">Detalles del grupo</h1>

  <div v-if="group && group.id" style="border: 1px solid var(--primary); border-radius: 3px; margin-bottom: 2rem">
    <div class="row bordered">
      <div class="col-12 col-md-3">
        <div class="text-weight-bold">Nombre del grupo</div>
        <div>{{ group.name }}</div>
      </div>

      <div class="col-12 col-md-3">
        <div class="text-weight-bold">Programa</div>
        <div>{{ group.program.name }}</div>
      </div>

      <div class="col-12 col-md-2">
        <div class="text-weight-bold">Fecha de creacion</div>
        <div>{{ new Date(group.created_at).toLocaleDateString() }}</div>
      </div>

      <div class="col-12 col-md-2">
        <div class="text-weight-bold">Miembros</div>
        <div>{{ group.candidates.length }}</div>
      </div>
      <div class="col-12 col-md-2 flex justify-end table-btn-group">
        <q-btn outline color="primary" icon="sym_o_edit" class="q-mr-sm" :to="`/grupos/${props.groupId}/editar`" />
        <q-btn outline color="negative" icon="sym_o_delete" label="" />
      </div>
    </div>
  </div>

  <div class="row items-center">
    <h3 class="page-subtitle">Planes</h3>
    <q-btn color="primary" label="Agregar plan" icon="add" class="q-ml-auto" :to="`/grupos/${group.id}/planes/crear`" />
  </div>

  <ProgramsTable :groupId="groupId" />
</template>

<style lang="scss">
.row.bordered {
  border: 1px solid $primary;
  border-radius: 3px;

  >div {
    border-right: 1px solid $primary;
    padding: 1rem;

    &:last-child {
      border-right: none;
    }
  }
}

.table-btn-group i {
  margin: 0 !important;
}
</style>

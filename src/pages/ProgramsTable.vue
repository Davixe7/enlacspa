<script setup>
import { api } from 'src/boot/axios'
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import notify from 'src/utils/notify'

const route = useRoute()
const props = defineProps(['groupId', 'candidateId', 'newCopy'])
const loading = ref(false)
const recentId = ref(route.query.recent ? route.query.recent : null)

watch(
  () => props.newCopy,
  (newVal) => {
    console.log('newcopy')
    rows.value.push(newVal)
  }
)

const columns = ref([
  { name: 'category', label: 'Plan', field: (row) => row.category.label },
  { name: 'subcategory', label: 'Tipo de Plan', field: (row) => row.subcategory.label },
  { name: 'name', label: 'Nombre del plan', field: 'name' },
  { name: 'created_at', label: 'Fecha de Elaboración', field: 'created_at' },
  { name: 'status', label: 'Estatus', field: (row) => (row.status ? 'Activo' : 'Inactivo') },
  { name: 'actions', label: 'Acciones', align: 'right' }
])

const rows = ref([])

async function fetchPrograms() {
  try {
    loading.value = true
    let route = props.groupId
      ? `plans/?group_id=${props.groupId}`
      : `personal_programs/?candidate_id=${props.candidateId}`
    rows.value = (await api.get(route)).data.data
  } catch (error) {
    console.log(error)
    notify.negative('Error al cargar los programas')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchPrograms()
})
</script>

<template>
  <q-table
    flat
    bordered
    :columns="columns"
    :rows="rows"
    :pagination="{ rowsPerPage: 0 }"
  >
    <template v-slot:body-cell-actions="props">
      <q-td :class="{ highlight: props.row.id == recentId }">
        <div class="q-table__actions">
          <q-btn
            flat
            round
            dense
            icon="sym_o_edit"
            :to="
              candidateId
                ? `/beneficiarios/${candidateId}/planes/${props.row.id}/editar`
                : `/grupos/${groupId}/planes/${props.row.id}/editar`
            "
          />
          <q-btn
            flat
            round
            dense
            icon="sym_o_visibility"
            :to="
              candidateId
                ? `/beneficiarios/${candidateId}/planes/${props.row.id}`
                : `/grupos/${groupId}/planes/${props.row.id}`
            "
          />
        </div>
      </q-td>
    </template>
    <template v-slot:bottom>
      <div class="flex justify-end full-width">
        Mostrando un total de: {{ rows.length }} resultados
      </div>
    </template>
  </q-table>
</template>

<style lang="scss">
th,
td {
  text-align: left !important;
}

th:last-child,
td:last-child {
  text-align: right !important;
}

tr:has(.highlight) td {
  will-change: background-color;
  transition: all 0.4s;
  background: lighten($positive, 50%);
}
</style>

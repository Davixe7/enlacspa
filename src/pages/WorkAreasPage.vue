<script setup>
import Notify from 'src/utils/notify';
import { api } from 'src/boot/axios';
import { onMounted, ref } from 'vue';

const workArea = ref({ name: '', id: null })
const loading = ref(false)
const dialog = ref(false)
const rows = ref([])
const columns = ref([
  {
    field: 'name', label: 'Nombre del Área', sortable: true, align: 'left'
  },
  {
    name: 'actions', label: 'Acciones', sortable: false, align: 'right'
  },
])

async function removeArea(areaIndex) {
  if (!window.confirm('Seguro que desea eliminar el area?')) return
  try {
    let id = rows.value[areaIndex].id
    await api.post(`work_areas/${id}`, { _method: 'DELETE' })
    rows.value.splice(areaIndex, 1)
    Notify.positive(`Área de trabajo eliminada exitosamente`)
  }
  catch (e) {
    Notify.negative(`No se pudo eliminar`)
    console.log(e);
  }
}

async function save() {
  loading.value = true
  let route = workArea.value.id ? `work_areas/${workArea.value.id}` : 'work_areas'
  let data = workArea.value.id ? { name: workArea.value.name, _method: 'PUT' } : { name: workArea.value.name }
  let actionLabel = workArea.value.id ? 'actualizada' : 'creada'
  try {
    let newWorkArea = (await api.post(route, data)).data.data;

    (workArea.value.id)
      ? rows.value.splice(rows.value.indexOf(workArea.value), 1, newWorkArea)
      : rows.value.push(newWorkArea)

    dialog.value = false
    Notify.positive(`Área de trabajo ${actionLabel} exitosamente`)
  } catch (error) {
    console.log(error);
    Notify.negative(`No se pudo guardar`)
  }
  loading.value = false
}

onMounted(async () => {
  rows.value = (await api.get('work_areas')).data.data
})
</script>

<template>
  <q-page>
    <div class="flex items-center q-mb-lg">
      <h1 class="page-title q-mb-0">
        Áreas de Trabajo
      </h1>
      <q-btn
        @click="() => { workArea = { name: '' }; dialog = true }"
        color="primary"
        icon="add"
        class="q-ml-auto"
      >Agregar área de trabajo</q-btn>
    </div>

    <q-table
      flat
      bordered
      :rows="rows"
      :columns="columns"
      :pagination="{ rowsPerPage: 0 }"
      hide-bottom
    >
      <template v-slot:body-cell-actions="props">
        <q-td class="justify-end text-right">
          <q-btn
            @click="() => { workArea = props.row; dialog = true }"
            icon="edit"
            flat
            round
          ></q-btn>

          <q-btn
            @click="() => removeArea(props.rowIndex)"
            icon="delete"
            flat
            round
          ></q-btn>
        </q-td>
      </template>
    </q-table>
  </q-page>

  <q-dialog v-model="dialog">
    <q-card style="width: 420px;">
      <q-form @submit.prevent="save">
        <q-card-section>
          <div class="q-page-titlte">
            {{ workArea.id ? 'Actualizar' : 'Agregar' }}
            Área de trabajo
          </div>
        </q-card-section>
        <q-card-section>
          <q-input
            required
            outlined
            stack-label
            label="Nombre del área de trabajo"
            v-model="workArea.name"
          ></q-input>
          <q-card-section class="flex justify-end q-px-none">
            <q-btn
              type="submit"
              color="primary"
              :loading="loading"
            >Guardar</q-btn>
          </q-card-section>
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

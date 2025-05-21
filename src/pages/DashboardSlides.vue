<script setup>
import { api } from 'src/boot/axios';
import notify from 'src/utils/notify';
import { onMounted, ref } from 'vue';
const rows = ref([])
const columns = ref([
  { name: 'thumb', label: 'Previa', sortable: false, align: 'left' },
  { name: 'title', label: 'Titulo', field: 'title', sortable: false, align: 'left' },
  { name: 'actions', label: 'Acciones', sortable: false, align: 'right' },
])

async function removeSlide(slide) {
  if (!window.confirm('Seguro que desea eliminar la diapositiva?')) return
  try {
    await api.post(`dashboard-slides/${slide.id}`, { _method: 'DELETE' })
    rows.value.splice(rows.value.indexOf(slide), 1)
    notify.positive('Eliminado con exito')
  }
  catch (error) {
    console.log(error);
    notify.negative('No se pudo eliminar')
  }
}

onMounted(async () => {
  rows.value = (await api.get('dashboard-slides')).data.data
})
</script>

<template>
  <div class="flex items-center">
    <h1 class="page-title">Carrusel Principal</h1>
    <q-btn
      to="carrusel/anadir-diapositiva"
      class="q-ml-auto"
      color="primary"
      icon="sym_o_add"
    >Anadir diapositiva
    </q-btn>
  </div>

  <q-table
    :rows="rows"
    :columns="columns"
    :pagination="{ rowsPerPage: 0 }"
    hide-bottom
  >
    <template v-slot:body-cell-thumb="props">
      <q-td>
        <q-img :src="props.row.thumb"></q-img>
      </q-td>
    </template>
    <template v-slot:body-cell-actions="props">
      <q-td class="text-right">
        <q-btn
          flat
          round
          icon="sym_o_delete"
          @click="removeSlide(props.row)"
        />
      </q-td>
    </template>
  </q-table>
</template>

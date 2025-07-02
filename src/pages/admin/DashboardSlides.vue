<script setup>
import { api } from 'src/boot/axios';
import notify from 'src/utils/notify';
import { onMounted, ref } from 'vue';
import draggable from 'vuedraggable'

const rows = ref([])

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

async function onDragEnd() {
  let id_order = rows.value.map((slide, i) => ({ id: slide.id, order: i }))
  try {
    let response = ((await api.post('dashboard-slides/reorder', { id_order }))).data.data
    console.log(response);
  }
  catch (error) {
    console.log(error);
    notify.negative('Error al reordenar las diapositivas')
  }
}
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

  <q-markup-table
    :rows="rows"
    hide-bottom
  >
    <thead>
      <tr>
        <th></th>
        <th class="text-left">Previa</th>
        <th class="text-left">Titulo</th>
        <th class="text-left">Estado</th>
        <th class="text-right">Acciones</th>
      </tr>
    </thead>
    <draggable
      v-if="rows"
      v-model="rows"
      :tag="'tbody'"
      :item-key="'id'"
      @change="onDragEnd"
    >
      <template #item="{ element }">
        <q-tr>
          <q-td>
            <q-icon name="sym_o_drag_handle"></q-icon>
          </q-td>
          <q-td>
            <q-img :src="element.thumb"></q-img>
          </q-td>
          <q-td>
            {{ element.title }}
          </q-td>
          <q-td>
            {{ element.status }}
          </q-td>
          <q-td class="text-right">
            <q-btn
              flat
              round
              icon="sym_o_delete"
              @click="removeSlide(element)"
            />
          </q-td>
        </q-tr>
      </template>
    </draggable>
  </q-markup-table>
</template>

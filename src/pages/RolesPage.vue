<script setup>
import { Notify } from 'quasar';
import { api } from 'src/boot/axios';
import { onMounted, ref } from 'vue';

const role = ref({ name: '', id: null })
const loading = ref(false)
const dialog = ref(false)
const rows = ref([])
const columns = ref([
  {
    field: 'name', label: 'Nombre del puesto', sortable: true, align: 'left'
  },
  {
    name: 'actions', label: 'Acciones', sortable: false, align: 'right'
  },
])

async function save() {
  loading.value = true
  let route = role.value.id ? `roles/${role.value.id}` : 'roles'
  let data = role.value.id ? { name: role.value.name, _method: 'PUT' } : { name: role.value.name }
  let actionLabel = role.value.id ? 'actualizado' : 'creado'
  try {
    let newRole = (await api.post(route, data)).data.data
    console.log(newRole);

    (role.value.id)
      ? rows.value.splice(rows.value.indexOf(role.value), 1, newRole)
      : rows.value.push(newRole)

    dialog.value = false
    Notify.create(`Puesto ${actionLabel} exitosamente`)
  } catch (error) {
    console.log(error);
    Notify.create(`No se pudo guardar`)
  }
  loading.value = false
}

onMounted(async () => {
  rows.value = (await api.get('roles')).data.data
})
</script>

<template>
  <q-page>
    <div class="flex items-center q-mb-lg">
      <h1 class="page-title q-mb-0">
        Puestos
      </h1>
      <q-btn
        @click="() => { role = { name: '' }; dialog = true }"
        color="primary"
        icon="add"
        class="q-ml-auto"
      >Agregar Puesto</q-btn>
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
            @click="() => { role = props.row; dialog = true }"
            icon="edit"
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
            {{ role.id ? 'Actualizar' : 'Agregar' }}
            puesto
          </div>
        </q-card-section>
        <q-card-section>
          <q-input
            required
            outlined
            stack-label
            label="Nombre del puesto"
            v-model="role.name"
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

<script setup>
import Notify from 'src/utils/notify'
import { api } from 'src/boot/axios'
import { computed, onMounted, ref } from 'vue'
import _ from 'lodash'

const role = ref({ name: '', label: '', id: null })
const loading = ref(false)
const dialog = ref(false)
const rows = ref([])
const columns = ref([
  {
    field: 'label',
    label: 'Nombre del puesto',
    sortable: true,
    align: 'left'
  },
  {
    name: 'actions',
    label: 'Acciones',
    sortable: false,
    align: 'right'
  }
])

const slugName = computed(() => _.kebabCase(role.value.label).replace(/-/g, '_'))

async function save() {
  loading.value = true
  let route = role.value.id ? `roles/${role.value.id}` : 'roles'
  let data = role.value.id
    ? { name: slugName.value, label: role.value.label, _method: 'PUT' }
    : { name: slugName.value, label: role.value.label }
  let actionLabel = role.value.id ? 'actualizado' : 'creado'

  try {
    let newRole = (await api.post(route, data)).data.data
    console.log(newRole)

    role.value.id
      ? rows.value.splice(rows.value.indexOf(role.value), 1, newRole)
      : rows.value.push(newRole)

    dialog.value = false
    Notify.positive(`Puesto ${actionLabel} exitosamente`)
  } catch (error) {
    console.log(error)
    Notify.negative(`No se pudo guardar`)
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
      <h1 class="page-title q-mb-0">Puestos</h1>
      <q-btn
        @click="
          () => {
            role = { name: '' }
            dialog = true
          }
        "
        color="primary"
        icon="add"
        class="q-ml-auto"
        >Agregar Puesto</q-btn
      >
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
        <q-td class="q-table__actions">
          <q-btn
            @click="
              () => {
                role = props.row
                dialog = true
              }
            "
            dense
            icon="sym_o_edit"
            flat
            round
          ></q-btn>
        </q-td>
      </template>
    </q-table>
  </q-page>

  <q-dialog v-model="dialog">
    <q-card style="width: 420px">
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
            v-model="role.label"
            :hint="'COD: ' + slugName"
          ></q-input>
          <q-card-section class="flex justify-end q-px-none">
            <q-btn
              type="submit"
              color="primary"
              :loading="loading"
              >Guardar</q-btn
            >
          </q-card-section>
        </q-card-section>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import Notify from 'src/utils/notify'
import { api } from 'src/boot/axios'
import { onMounted, ref } from 'vue'

const errors = ref({})
const loading = ref(false)
const dialog = ref(false)

const workAreas = ref([])
const roles = ref([])
const users = ref([])

const user = ref({})
const rows = ref([])
const columns = ref([
  {
    field: 'full_name',
    label: 'Nombre',
    sortable: true,
    align: 'left'
  },
  {
    field: 'email',
    label: 'Email',
    sortable: true,
    align: 'left'
  },
  {
    field: (row) => row.work_area.name,
    label: 'Area',
    sortable: true,
    align: 'left'
  },
  {
    field: (row) => (row.role ? row.role.name : ''),
    label: 'Puesto',
    sortable: true,
    align: 'left'
  },
  {
    field: (row) => (row.leader ? row.leader.name : 'Ninguno'),
    label: 'Lider',
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

async function save() {
  loading.value = true
  errors.value = {}
  let route = user.value.id ? `users/${user.value.id}` : 'users'
  let data = user.value.id ? { ...user.value, _method: 'PUT' } : { ...user.value }
  let actionLabel = user.value.id ? 'actualizado' : 'creado'
  try {
    let newUser = (await api.post(route, data)).data.data

    user.value.id
      ? rows.value.splice(rows.value.indexOf(user.value), 1, newUser)
      : rows.value.push(newUser)

    dialog.value = false
    Notify.positive(`Usuario ${actionLabel} exitosamente`)
  } catch (error) {
    errors.value = error.status == 422 && error.formatted ? error.formatted : {}
    Notify.negative(`No se pudo guardar`)
  }
  loading.value = false
}

onMounted(async () => {
  workAreas.value = (await api.get('work_areas')).data.data
  roles.value = (await api.get('roles')).data.data
  users.value = (await api.get('users')).data.data
  rows.value = (await api.get('users')).data.data
})
</script>

<template>
  <q-page>
    <div class="flex items-center q-mb-lg">
      <h1 class="page-title q-mb-0">Usuarios</h1>
      <q-btn
        @click="
          () => {
            user = { name: '' }
            dialog = true
          }
        "
        color="primary"
        icon="add"
        class="q-ml-auto"
        >Agregar usuario</q-btn
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
        <q-td class="justify-end text-right">
          <q-btn
            @click="
              () => {
                user = props.row
                dialog = true
                errors = {}
              }
            "
            icon="edit"
            flat
            round
          ></q-btn>
        </q-td>
      </template>
    </q-table>
  </q-page>

  <q-dialog v-model="dialog">
    <q-card style="width: 520px">
      <q-form @submit.prevent="save">
        <q-card-section>
          <div class="q-page-titlte">
            {{ user.id ? 'Actualizar' : 'Agregar' }}
            usuario
          </div>
        </q-card-section>
        <q-card-section class="q-gutter-y-lg">
          <q-input
            required
            outlined
            stack-label
            label="Nombre"
            v-model="user.name"
            hide-bottom-space
            :error="!!errors.name"
            :error-message="errors.name"
          ></q-input>

          <q-input
            required
            outlined
            stack-label
            label="Apellido Paterno"
            v-model="user.last_name"
            hide-bottom-space
            :error="!!errors.last_name"
            :error-message="errors.last_name"
          ></q-input>

          <q-input
            required
            outlined
            stack-label
            label="Apellido Materno"
            v-model="user.second_last_name"
            hide-bottom-space
            :error="!!errors.second_last_name"
            :error-message="errors.second_last_name"
          ></q-input>

          <q-input
            outlined
            stack-label
            type="tel"
            label="Teléfono"
            v-model="user.phone"
            hide-bottom-space
            :error="!!errors.phone"
            :error-message="errors.phone"
            mask="##########"
          ></q-input>

          <q-select
            required
            outlined
            stack-label
            label="Área"
            v-model="user.work_area_id"
            :options="workAreas"
            option-value="id"
            option-label="name"
            map-options
            emit-value
            hide-bottom-space
            :error="!!errors.work_area_id"
            :error-message="errors.work_area_id"
          ></q-select>

          <q-select
            required
            outlined
            stack-label
            label="Puesto"
            v-model="user.role_id"
            :options="roles"
            option-value="id"
            option-label="label"
            map-options
            emit-value
            hide-bottom-space
            :error="!!errors.role_id"
            :error-message="errors.role_id"
          ></q-select>

          <q-select
            required
            outlined
            stack-label
            label="Líder"
            v-model="user.leader_id"
            :options="users"
            option-value="id"
            option-label="name"
            map-options
            emit-value
            hide-bottom-space
            :error="!!errors.leader_id"
            :error-message="errors.leader_id"
          ></q-select>

          <q-input
            required
            outlined
            stack-label
            type="date"
            label="Fecha de ingreso"
            v-model="user.entry_date"
            hide-bottom-space
            :error="!!errors.entry_date"
            :error-message="errors.entry_date"
          ></q-input>

          <q-input
            required
            outlined
            stack-label
            type="email"
            label="Email"
            v-model="user.email"
            hide-bottom-space
            :error="!!errors.email"
            :error-message="errors.email"
          >
            <template v-slot:append="">
              <q-btn
                flat
                dense
                round
                icon="sym_o_alternate_email"
                @click="() => (user.email = user.email + '@')"
              /> </template
          ></q-input>

          <q-input
            outlined
            stack-label
            type="password"
            label="Contraseña"
            v-model="user.password"
            hide-bottom-space
            :error="!!errors.password"
            :error-message="errors.password"
            autocomplete="new-password"
          ></q-input>

          <div class="flex justify-between items-center">
            <label for="#">Estatus</label>
            <div>
              <q-radio
                class="q-mr-md"
                v-model="user.status"
                :val="1"
                label="Activo"
              />
              <q-radio
                v-model="user.status"
                :val="0"
                label="Inactivo"
              />
            </div>
          </div>

          <div class="flex justify-between items-center">
            <label for="#">Es administrador</label>
            <div>
              <q-radio
                class="q-mr-md"
                v-model="user.is_admin"
                :val="1"
                label="Si"
              />
              <q-radio
                v-model="user.is_admin"
                :val="0"
                label="No"
              />
            </div>
          </div>

          <div class="flex justify-between items-center">
            <label for="#">Es evaluador</label>
            <div>
              <q-radio
                v-model="user.is_evaluator"
                class="q-mr-md"
                :val="1"
                label="Si"
              />
              <q-radio
                v-model="user.is_evaluator"
                :val="0"
                label="No"
              />
            </div>
          </div>

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

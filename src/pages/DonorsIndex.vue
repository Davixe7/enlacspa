<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref, watch } from 'vue'
import notify from 'src/utils/notify'
import DonorKardexModal from 'components/DonorKardexModal.vue'
import ApplyDonationDialog from 'components/ApplyDonationDialog.vue'

const loading = ref(false)
const rows = ref([])
const donationDialog = ref(null)

function openDonation() {
  donationDialog.value.open() // Llamamos al método open() de la modal
}
//const activities = ref([])
const selectedActivityId = ref(null)

// Control del mega modal del Kardex
const kardexModalRef = ref(null)

// Columnas EXACTAS solicitadas para la vista principal
const columns = ref([
  {
    align: 'left',
    name: 'donor_name',
    label: 'NOMBRE DEL DONANTE',
    field: (row) =>
      row.donor_type === 'Moral' ? row.business_name : `${row.first_name} ${row.last_name}`,
    sortable: true
  },
  { align: 'left', name: 'work_place', label: 'EMPRESA', field: 'work_place', sortable: true },
  { align: 'left', name: 'work_position', label: 'PUESTO', field: 'work_position', sortable: true },
  { align: 'left', name: 'cellphone', label: 'TELÉFONO CELULAR', field: 'cellphone' },
  { align: 'left', name: 'birthday', label: 'FECHA DE CUMPLEAÑOS', field: 'birthday' },
  { align: 'left', name: 'sector', label: 'SECTOR', field: 'sector', sortable: true },
  { align: 'center', name: 'is_active', label: 'ESTATUS' },
  { align: 'right', name: 'actions', label: 'ACCIONES' }
])

const activityTypes = [
  'Alcancía',
  'Alianza',
  'Boteo',
  'Donativos Varios',
  'Fundaciones',
  'Natación',
  'Obsequio entre Amigos',
  'Organismos de Gobierno',
  'Programa de Verano',
  'Proyecto Interno',
  'Radiomaratón'
]

async function fetchInitialData() {
  try {
    loading.value = true
    // Cargar donantes directamente
    await fetchDonors()
  } catch (error) {
    console.error(error)
    notify.negative('Error al cargar la información inicial')
  } finally {
    loading.value = false
  }
}

async function fetchDonors() {
  try {
    loading.value = true
    let url = '/donors'
    if (selectedActivityId.value) {
      url += `?activity_type=${selectedActivityId.value}`
    }
    const response = await api.get(url)
    let data = response.data.data || response.data

    // Configurar el ORDEN ALFABÉTICO por Nombre Completo solicitado
    rows.value = data.sort((a, b) => {
      const nameA = a.donor_type === 'Moral' ? a.business_name : `${a.first_name} ${a.last_name}`
      const nameB = b.donor_type === 'Moral' ? b.business_name : `${b.first_name} ${b.last_name}`
      return nameA.localeCompare(nameB)
    })
  } catch (error) {
    console.error(error)
    notify.negative('No se pudieron obtener los donantes')
  } finally {
    loading.value = false
  }
}

// Switch Activo / Inactivo con guardado automático
async function toggleStatus(row) {
  try {
    const route = `/donors/${row.id}/toggle-status`
    await api.post(route, { is_active: row.is_active })
    notify.positive('Estatus y fechas de cambio actualizadas en el servidor')
  } catch (error) {
    console.error(error)
    notify.negative('No se pudo guardar el cambio de estatus')
    row.is_active = row.is_active === 1 ? 0 : 1
  }
}

function openCreate() {
  kardexModalRef.value.open()
}

function openEdit(row) {
  kardexModalRef.value.open(row)
}

watch(selectedActivityId, () => {
  fetchDonors()
})

onMounted(() => {
  fetchInitialData()
})
</script>

<template>
  <div class="flex items-center q-mb-lg">
    <div>
      <h1 class="page-title q-mb-none">Donantes para Procuración de Fondos</h1>
    </div>

    <div class="flex items-center q-gutter-x-sm q-ml-auto">
      <q-btn
        icon="sym_o_add_card"
        color="primary"
        label="Aplicar Donativo"
        @click="openDonation"
      />
      <q-btn
        icon="sym_o_person_add"
        color="primary"
        label="Nuevo Donante"
        @click="openCreate"
      />
    </div>
  </div>

  <q-card
    flat
    bordered
    class="q-mb-md bg-grey-1"
  >
    <q-card-section class="row items-center q-gutter-x-md q-py-sm">
      <div class="text-weight-bold text-grey-8">Tipo de Actividad:</div>
      <q-select
        outlined
        dense
        bg-color="white"
        style="width: 300px"
        v-model="selectedActivityId"
        :options="activityTypes"
        placeholder="Todos los tipos"
        clearable
        hide-bottom-space
      />
    </q-card-section>
  </q-card>

  <q-table
    :columns="columns"
    :rows="rows"
    :loading="loading"
    :pagination="{ rowsPerPage: 10 }"
    flat
    bordered
  >
    <template v-slot:body-cell-is_active="props">
      <q-td class="text-center">
        <q-toggle
          v-model="props.row.is_active"
          :true-value="1"
          :false-value="0"
          color="primary"
          @update:model-value="toggleStatus(props.row)"
        />
      </q-td>
    </template>

    <template v-slot:body-cell-actions="props">
      <q-td class="flex justify-end">
        <q-btn
          icon="sym_o_badge"
          label="Kardex"
          flat
          dense
          color="secondary"
          @click="openEdit(props.row)"
        />
      </q-td>
    </template>
  </q-table>

  <DonorKardexModal
    ref="kardexModalRef"
    @saved="fetchDonors"
  />
  <ApplyDonationDialog ref="donationDialog" />
</template>

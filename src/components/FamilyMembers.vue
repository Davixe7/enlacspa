<script setup>
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'
import { computed, onMounted, ref, watch } from 'vue'

const props = defineProps(['candidateId'])
const model = defineModel()

onMounted(() => {
  fetchRows()
})

const columns = [
  { name: 'name', label: 'Nombre completo', field: 'name', align: 'left' },
  { name: 'age', label: 'Edad', field: 'age', align: 'left' },
  { name: 'relationship', label: 'Parentesco', field: 'relationship', align: 'left' },
  { name: 'marital_status', label: 'Estado civil', field: 'marital_status', align: 'left' },
  { name: 'scolarship', label: 'Escolaridad', field: 'scolarship', align: 'left' },
  { name: 'ocupation', label: 'Ocupación', field: 'ocupation', align: 'left' },
  { name: 'monthly_income', label: 'Ingresos mensuales', field: 'monthly_income', align: 'left' },
  {
    name: 'monthly_contribution',
    label: 'Aportación mensual',
    field: 'monthly_contribution',
    align: 'left'
  }
]

// 1. Fila por defecto
const rows = ref([
  {
    name: 'Juan Pérez',
    age: 30,
    relationship: 'Titular',
    marital_status: 'Soltero',
    scolarship: 'Licenciatura',
    ocupation: 'Desarrollador',
    monthly_income: 25000,
    monthly_contribution: 5000
  }
])

async function fetchRows() {
  try {
    loading.value = true
    rows.value = (await api.get(`family_members/?candidate_id=${props.candidateId}`)).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

// 2. Estado del formulario y diálogo
const showDialog = ref(false)
const formData = ref({
  name: '',
  age: '',
  relationship: '',
  marital_status: '',
  scolarship: '',
  ocupation: '',
  monthly_income: 0,
  monthly_contribution: 0,
  candidate_id: props.candidateId
})

const monthlyIncomeSum = computed(() => {
  return rows.value.reduce((sum, row) => Number(row.monthly_income) + sum, 0).toFixed(2)
})

const monthlyContributionSum = computed(() => {
  return rows.value.reduce((sum, row) => Number(row.monthly_contribution) + sum, 0).toFixed(2)
})

const loading = ref(false)

// 3. Función para guardar
const onSave = async () => {
  try {
    loading.value = true
    let response = (await api.post('family_members', { ...formData.value })).data.data
    rows.value.push(response)
    showDialog.value = false
    clearForm()
  } catch (error) {
    notify.negative('Error al guardar el miembro familiar')
    console.log(error)
  } finally {
    loading.value = false
  }
}

function clearForm() {
  formData.value = {
    name: '',
    age: '',
    relationship: '',
    marital_status: '',
    scolarship: '',
    ocupation: '',
    monthly_income: 0,
    monthly_contribution: 0,
    candidate_id: props.candidateId
  }
}
const relationshipOptions = [
  'Madre/Padre',
  'Hijo / Hija',
  'Hermano(a)',
  'Abuelo(a)',
  'Padrastro/Madrastra',
  'Hermanastro/Hermanastra',
  'Primo(a)',
  'Tío(a)'
]

const maritalStatusOptions = [
  'Soltero(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viudo(a)',
  'Unión Libre',
  'Desconocido'
]

watch(monthlyIncomeSum, (newVal) => {
  model.value = { income: newVal, contribution: monthlyContributionSum.value }
})

watch(monthlyContributionSum, (newVal) => {
  model.value = { income: monthlyIncomeSum.value, contribution: newVal }
})
</script>

<template>
  <div class="">
    <q-table
      :columns="columns"
      :rows="rows"
      row-key="name"
      bordered
      hide-bottom
      flat
      class="q-mb-md"
    >
      <template v-slot:bottom-row>
        <q-tr class="bg-grey-2 text-weight-bold">
          <q-td
            colspan="6"
            class="text-right"
          >
            Totales:
          </q-td>
          <q-td> $ {{ monthlyIncomeSum }} </q-td>
          <q-td> $ {{ monthlyContributionSum }} </q-td>
        </q-tr>
      </template></q-table
    >

    <div class="flex justify-end">
      <q-btn
        label="Agregar Familiar"
        color="primary"
        icon="add"
        @click="showDialog = true"
        class="q-mb-md"
      />
    </div>

    <q-dialog
      v-model="showDialog"
      persistent
      position="right"
      full-height=""
    >
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Nuevo Registro</div>
        </q-card-section>

        <q-form @submit="onSave">
          <q-card-section class="q-pt-none">
            <div class="q-gutter-y-md">
              <q-input
                outlined
                v-model="formData.name"
                label="Nombre completo"
                required
              />
              <q-input
                outlined
                v-model.number="formData.age"
                type="number"
                label="Edad"
              />
              <q-select
                outlined
                :options="relationshipOptions"
                v-model="formData.relationship"
                label="Parentesco"
              />
              <q-select
                outlined
                :options="maritalStatusOptions"
                v-model="formData.marital_status"
                label="Estado civil"
              />
              <q-input
                outlined
                v-model="formData.scolarship"
                label="Escolaridad"
              />
              <q-input
                v-model="formData.ocupation"
                label="Ocupación"
                outlined
              />
              <q-input
                outlined
                v-model.number="formData.monthly_income"
                type="number"
                label="Ingresos"
                prefix="$"
              />
              <q-input
                outlined
                v-model.number="formData.monthly_contribution"
                type="number"
                label="Aportación"
                prefix="$"
              />
            </div>
          </q-card-section>

          <q-card-actions
            align="right"
            class="text-primary"
          >
            <q-btn
              flat
              label="Cancelar"
              v-close-popup
            />
            <q-btn
              color="primary"
              label="Guardar"
              type="submit"
              :loading="loading"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<style>
.q-field--labeled .q-field__prefix {
  padding-top: 9px;
}
</style>

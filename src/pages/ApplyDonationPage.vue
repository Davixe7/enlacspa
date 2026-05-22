<script setup>
import { api } from 'src/boot/axios'
import { onMounted, ref, watch } from 'vue'
import notify from 'src/utils/notify'
import { date } from 'quasar'

// --- ESTADO DEL FORMULARIO ---
const loading = ref(false)
const errors = ref({})
//const donors = ref([]) // Para el Smart Search
const donorOptions = ref([])
const procurationActivities = ref([]) // Catálogo completo
const filteredActivities = ref([]) // Actividades filtradas por tipo
const beneficiaries = ref([]) // Para Natación/Verano

const form = ref({
  donor_id: null,
  procuration_activity_id: null,
  activity_type: '',
  concept: '',
  payment_date: date.formatDate(Date.now(), 'YYYY-MM-DD'),
  payment_method: 'Efectivo',
  reference: '',
  amount: 0,
  currency: 'MXN',
  exchange_rate: 1,
  equivalent_amount_mxn: 0,
  has_tax_receipt: false,
  tax_receipt_number: '',
  // Campos dinámicos
  piggy_bank_location: '',
  project_name: '',
  boteo_area: '',
  boteo_can_number: '',
  boteo_ten_percent: 0,
  beneficiary_id: null,
  external_name: '',
  group_name: '',
  government_institution_name: ''
})

// --- OPCIONES FIJAS ---
const activityTypes = [
  'Alcancía',
  'Alianza',
  'Boteo',
  'Donativos Varios',
  'Fundaciones',
  'Natación',
  'Organismos de Gobierno',
  'Programa de Verano',
  'Proyecto Interno',
  'Radiomaratón'
]

const paymentMethods = [
  'Efectivo',
  'Transferencia',
  'Depósito',
  'Cheque',
  'Tarjeta Débito',
  'Tarjeta Crédito',
  'Oxxo'
]

// --- LÓGICA DE BÚSQUEDA INTELIGENTE (DONANTES) ---
async function filterDonors(val, update) {
  if (val.length < 2) {
    update(() => {
      donorOptions.value = []
    })
    return
  }
  try {
    // Buscamos en el catálogo de donantes
    const response = await api.get(`/donors?search=${val}`)
    update(() => {
      donorOptions.value = response.data.data || response.data
    })
  } catch (e) {
    console.error(e)
  }
}

// --- FILTRADO DE ACTIVIDADES POR TIPO ---
watch(
  () => form.value.activity_type,
  (newType) => {
    form.value.procuration_activity_id = null // Reset actividad al cambiar tipo
    filteredActivities.value = procurationActivities.value.filter(
      (a) => a.type === newType && a.is_active
    )
  }
)

// --- CÁLCULOS AUTOMÁTICOS ---
// 1. Equivalencia en Pesos
watch([() => form.value.amount, () => form.value.exchange_rate, () => form.value.currency], () => {
  if (form.value.currency === 'DLLS') {
    form.value.equivalent_amount_mxn = (form.value.amount * form.value.exchange_rate).toFixed(2)
  } else {
    form.value.equivalent_amount_mxn = form.value.amount
  }
})

// 2. 10% Boteo
watch(
  () => form.value.amount,
  (newVal) => {
    if (form.value.activity_type === 'Boteo') {
      form.value.boteo_ten_percent = (newVal * 0.1).toFixed(2)
    }
  }
)

// --- CARGA INICIAL ---
onMounted(async () => {
  try {
    // Cargamos actividades de procuración (el catálogo que hicimos)
    const resActivities = await api.get('/procuration-activities')
    procurationActivities.value = resActivities.data.data || resActivities.data

    // Cargamos beneficiarios (opcional según tu sistema)
    const resBen = await api.get('/beneficiaries')
    beneficiaries.value = resBen.data.data || resBen.data
  } catch (e) {
    console.log(e)
    notify.negative('Error al cargar catálogos iniciales')
  }
})

// --- GUARDADO ---
async function submitDonation(print = false) {
  try {
    loading.value = true
    errors.value = {}

    // Limpiamos el objeto donor_id porque QSelect devuelve el objeto completo
    const payload = {
      ...form.value,
      donor_id: form.value.donor_id?.id
    }

    const response = await api.post('/donations', payload)
    notify.positive(response.data.message)

    if (print) {
      generateTicket(response.data.data)
    }

    resetForm()
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors
    } else {
      notify.negative('No se pudo procesar el donativo')
    }
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    /* Reiniciar valores iniciales */
  }
  form.value.payment_date = date.formatDate(Date.now(), 'YYYY-MM-DD')
  form.value.payment_method = 'Efectivo'
  form.value.currency = 'MXN'
}

function generateTicket(donation) {
  // Aquí iría tu lógica de PDFMake o Window.print para el ticket de 8cm
  console.log('Generando ticket para folio:', donation.folio_number)
  notify.info(`Imprimiendo Folio: ${donation.folio_number}`)
}
</script>

<template>
  <q-page
    padding
    class="bg-grey-2"
  >
    <div class="row justify-center">
      <div class="col-12 col-md-10">
        <q-card
          flat
          bordered
          class="q-pa-md shadow-2"
        >
          <q-card-section class="row items-center q-pb-none">
            <h1 class="page-title q-mb-none">Aplicar Donativo</h1>
            <q-space />
            <div class="text-h6 text-primary text-weight-bolder">Folio: P-26-XXXXX</div>
          </q-card-section>

          <q-form @submit.prevent="submitDonation(false)">
            <div class="row q-col-gutter-md q-mt-md">
              <div class="col-12 col-sm-6">
                <div class="text-subtitle2 text-weight-bold">Donante (Búsqueda Inteligente)</div>
                <q-select
                  v-model="form.donor_id"
                  use-input
                  outlined
                  dense
                  label="Escriba nombre o razón social"
                  :options="donorOptions"
                  option-label="name"
                  @filter="filterDonors"
                  :error="!!errors.donor_id"
                  :error-message="errors.donor_id?.[0]"
                >
                  <template v-slot:no-option>
                    <q-item
                      ><q-item-section class="text-grey"
                        >No se encontraron resultados</q-item-section
                      ></q-item
                    >
                  </template>
                </q-select>
              </div>

              <div class="col-12 col-sm-6">
                <div class="text-subtitle2 text-weight-bold">RFC / Razón Social</div>
                <q-input
                  outlined
                  dense
                  readonly
                  :model-value="form.donor_id?.rfc || 'Seleccione un donante'"
                  bg-color="grey-3"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.activity_type"
                  outlined
                  dense
                  label="Tipo de Actividad"
                  :options="activityTypes"
                  :error="!!errors.activity_type"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.procuration_activity_id"
                  outlined
                  dense
                  label="Actividad Específica"
                  :options="filteredActivities"
                  option-label="name"
                  option-value="id"
                  map-options
                  emit-value
                  :disable="!form.activity_type"
                  :error="!!errors.procuration_activity_id"
                />
              </div>
            </div>

            <q-separator class="q-my-lg" />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="form.concept"
                  outlined
                  dense
                  label="Concepto del Pago"
                  type="textarea"
                  rows="2"
                />
              </div>
              <div class="col-12 col-sm-4">
                <q-input
                  v-model="form.payment_date"
                  outlined
                  dense
                  label="Fecha de Pago"
                  type="date"
                />
                <q-select
                  v-model="form.payment_method"
                  outlined
                  dense
                  label="Forma de Pago"
                  :options="paymentMethods"
                  class="q-mt-sm"
                />
              </div>

              <div class="col-12 col-sm-3">
                <q-input
                  v-model.number="form.amount"
                  outlined
                  dense
                  label="Monto"
                  type="number"
                  step="0.01"
                  prefix="$"
                />
              </div>
              <div class="col-12 col-sm-3">
                <q-select
                  v-model="form.currency"
                  outlined
                  dense
                  label="Moneda"
                  :options="['MXN', 'DLLS']"
                />
              </div>

              <template v-if="form.currency === 'DLLS'">
                <div class="col-12 col-sm-3">
                  <q-input
                    v-model.number="form.exchange_rate"
                    outlined
                    dense
                    label="T. Cambio"
                    type="number"
                    step="0.0001"
                    color="orange"
                  />
                </div>
                <div class="col-12 col-sm-3">
                  <q-input
                    :model-value="form.equivalent_amount_mxn"
                    outlined
                    dense
                    label="Equiv. Pesos"
                    readonly
                    bg-color="orange-1"
                  />
                </div>
              </template>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.reference"
                  outlined
                  dense
                  label="Referencia / No. Operación"
                />
              </div>

              <div class="col-12 col-sm-6 flex items-center">
                <q-checkbox
                  v-model="form.has_tax_receipt"
                  label="¿Requiere Recibo Deducible?"
                />
                <q-input
                  v-if="form.has_tax_receipt"
                  v-model="form.tax_receipt_number"
                  outlined
                  dense
                  label="No. de Recibo"
                  class="q-ml-md flex-grow"
                />
              </div>
            </div>

            <div
              v-if="form.activity_type"
              class="q-mt-lg q-pa-md bg-blue-grey-1 rounded-borders"
            >
              <div class="text-subtitle1 text-weight-bold q-mb-sm text-blue-grey-8">
                <q-icon name="extension" /> Detalles de {{ form.activity_type }}
              </div>

              <div
                v-if="form.activity_type === 'Alcancía'"
                class="row"
              >
                <q-input
                  v-model="form.piggy_bank_location"
                  outlined
                  dense
                  label="Ubicada en (Establecimiento/Lugar)"
                  class="col-12"
                />
              </div>

              <div
                v-if="['Alianza', 'Fundaciones'].includes(form.activity_type)"
                class="row"
              >
                <q-input
                  v-model="form.project_name"
                  outlined
                  dense
                  label="Nombre del Proyecto / Convenio"
                  class="col-12"
                />
              </div>

              <div
                v-if="form.activity_type === 'Boteo'"
                class="row q-col-gutter-sm"
              >
                <q-input
                  v-model="form.boteo_area"
                  outlined
                  dense
                  label="Área de Boteo"
                  class="col-4"
                />
                <q-input
                  v-model="form.boteo_can_number"
                  outlined
                  dense
                  label="No. de Bote"
                  class="col-4"
                />
                <q-input
                  v-model="form.boteo_ten_percent"
                  outlined
                  dense
                  label="10% Boteo (Auto)"
                  readonly
                  class="col-4"
                  bg-color="white"
                />
              </div>

              <div
                v-if="['Natación', 'Programa de Verano'].includes(form.activity_type)"
                class="row q-col-gutter-sm"
              >
                <q-select
                  v-model="form.beneficiary_id"
                  outlined
                  dense
                  label="Seleccionar Beneficiario"
                  :options="beneficiaries"
                  option-label="full_name"
                  option-value="id"
                  map-options
                  emit-value
                  class="col-4"
                />
                <q-input
                  v-model="form.external_name"
                  outlined
                  dense
                  label="Nombre Externo (Si no es beneficiario)"
                  class="col-4"
                />
                <q-input
                  v-model="form.group_name"
                  outlined
                  dense
                  label="Grupo / Clase"
                  class="col-4"
                />
              </div>

              <div
                v-if="form.activity_type === 'Organismos de Gobierno'"
                class="row"
              >
                <q-input
                  v-model="form.government_institution_name"
                  outlined
                  dense
                  label="Dependencia / Institución de Gobierno"
                  class="col-12"
                />
              </div>
            </div>

            <div class="row justify-end q-mt-xl q-gutter-x-md">
              <q-btn
                flat
                label="Cancelar"
                color="grey-7"
                @click="resetForm"
              />
              <q-btn
                outline
                icon="print"
                label="Guardar e Imprimir Ticket"
                color="secondary"
                :loading="loading"
                @click="submitDonation(true)"
              />
              <q-btn
                unelevated
                icon="save"
                label="Guardar Donativo"
                color="primary"
                :loading="loading"
                type="submit"
              />
            </div>
          </q-form>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.rounded-borders {
  border-radius: 8px;
}
.flex-grow {
  flex-grow: 1;
}
</style>

<script setup>
import { api } from 'src/boot/axios'
import { ref, watch } from 'vue'
import notify from 'src/utils/notify'
import { date } from 'quasar'

const dialog = ref(false)
const loading = ref(false)
const errors = ref({})

// Catálogos y Opciones Dinámicas
const donorOptions = ref([])
const beneficiaryOptions = ref([])
const procurationActivities = ref([])
const filteredActivities = ref([])
const fiscalOptions = ref([])

const form = ref({
  donor_id: null,
  fiscal_record_id: null,
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
  piggy_bank_location: '',
  project_name: '',
  boteo_area: '',
  boteo_can_number: '',
  boteo_ten_percent: 0,
  government_institution_name: '',
  beneficiary_id: null,
  external_name: '',
  group_name: ''
})

const activityTypes = [
  'Alcancía',
  'Alianza',
  'Boteo',
  'Donativos Varios',
  'Fundaciones',
  'Natación',
  'Obsequio entre amigos',
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

// --- FUNCIONES DE APERTURA Y CARGA ---
function open() {
  resetForm()
  loadInitialData()
  dialog.value = true
}

async function loadInitialData() {
  try {
    const resAct = await api.get('/procuration-activities')
    procurationActivities.value = resAct.data.data || resAct.data || []
  } catch (e) {
    console.error(e)
    notify.negative('No se pudieron cargar las actividades de procuración')
  }
}

// --- SMART SEARCH: DONANTES ---
async function filterDonors(val, update, abort) {
  if (val.trim().length < 2) {
    abort()
    return
  }
  try {
    const response = await api.get(`/donors/search-all?search=${val}`)
    const dataFetched = response.data || []
    update(() => {
      donorOptions.value = dataFetched
    })
  } catch (e) {
    console.error('Error al filtrar:', e)
    abort()
  }
}

// --- SMART SEARCH: BENEFICIARIOS ---
async function filterBeneficiaries(val, update, abort) {
  if (val.trim().length < 2) {
    abort()
    return
  }
  try {
    const response = await api.get(`/beneficiaries?type=search&name=${val}`)
    const dataFetched = response.data.data || []

    update(() => {
      // Mapeamos los resultados para asegurarnos de que usen 'label'
      beneficiaryOptions.value = dataFetched.map((item) => ({
        id: item.value, // Homologamos el 'value' del backend como el 'id' que usa el formulario
        label: item.label // El 'label' ya viene ordenado correctamente desde el CONCAT_WS del Controlador
      }))
    })
  } catch (e) {
    console.error('Error al filtrar beneficiarios:', e)
    abort()
  }
}

// --- WATCHERS CRÍTICOS (REACTIVIDAD) ---

// Cambios en Donante
watch(
  () => form.value.donor_id,
  (newVal) => {
    form.value.fiscal_record_id = null
    fiscalOptions.value = []

    if (!newVal) return

    if (newVal.origin === 'donante') {
      if (newVal.fiscal_records?.length > 0) {
        fiscalOptions.value = newVal.fiscal_records
        if (newVal.fiscal_records.length === 1) {
          form.value.fiscal_record_id = newVal.fiscal_records[0].id
        }
      }
    } else if (newVal.origin === 'sponsor') {
      fiscalOptions.value = [
        {
          id: 'sponsor-' + newVal.id, // ID único para diferenciarlo
          tax_name: newVal.company_name || newVal.full_name, // Su razón social
          rfc: 'N/A'
        }
      ]
      form.value.fiscal_record_id = 'sponsor-' + newVal.id
    }
  }
)

// Filtrar Actividades Específicas y resetear sub-campos dinámicos al cambiar de tipo
watch(
  () => form.value.activity_type,
  (newType) => {
    form.value.procuration_activity_id = null

    // Limpieza preventiva de campos condicionales
    form.value.piggy_bank_location = ''
    form.value.project_name = ''
    form.value.government_institution_name = ''
    form.value.beneficiary_id = null
    form.value.external_name = ''
    form.value.group_name = ''
    form.value.boteo_area = ''
    form.value.boteo_can_number = ''
    form.value.boteo_ten_percent = 0

    if (!newType) {
      filteredActivities.value = []
      return
    }
    filteredActivities.value = procurationActivities.value.filter((activity) => {
      const matchesType = activity.type === newType
      const isActive =
        activity.is_active === 1 || activity.is_active === true || activity.is_active === '1'
      return matchesType && isActive
    })
  }
)

// Conversiones cambiarias MXN / DLLS
watch([() => form.value.amount, () => form.value.exchange_rate, () => form.value.currency], () => {
  if (form.value.currency === 'DLLS') {
    form.value.equivalent_amount_mxn = (
      Number(form.value.amount || 0) * Number(form.value.exchange_rate || 1)
    ).toFixed(2)
  } else {
    form.value.equivalent_amount_mxn = Number(form.value.amount || 0).toFixed(2)
  }
})

// Autocálculo del 10% de Boteo
watch(
  () => form.value.amount,
  (newVal) => {
    if (form.value.activity_type === 'Boteo') {
      form.value.boteo_ten_percent = (Number(newVal || 0) * 0.1).toFixed(2)
    }
  }
)

// --- GUARDADO ---
async function save() {
  try {
    loading.value = true
    errors.value = {}

    const payload = {
      ...form.value,
      donor_id: form.value.donor_id?.origin === 'donante' ? form.value.donor_id.id : null,
      sponsor_id: form.value.donor_id?.origin === 'sponsor' ? form.value.donor_id.id : null,
      beneficiary_id: form.value.beneficiary_id?.id || null
    }

    const response = await api.post('/donations', payload)
    const folio = response.data?.data?.folio_number || ''
    notify.positive(`Donativo aplicado con éxito. Folio: ${folio}`)
    dialog.value = false
  } catch (error) {
    if (error.response?.status === 422) {
      errors.value = error.response.data.errors
    } else {
      notify.negative('Error al guardar el donativo')
    }
  } finally {
    loading.value = false
  }
}

async function saveAndPrint() {
  try {
    loading.value = true
    errors.value = {}

    const payload = {
      ...form.value,
      donor_id: form.value.donor_id?.origin === 'donante' ? form.value.donor_id.id : null,
      sponsor_id: form.value.donor_id?.origin === 'sponsor' ? form.value.donor_id.id : null,
      fiscal_record_id:
        typeof form.value.fiscal_record_id === 'string' &&
        form.value.fiscal_record_id.startsWith('sponsor-')
          ? null
          : form.value.fiscal_record_id,
      beneficiary_id: form.value.beneficiary_id?.id || null
    }

    const response = await api.post('/donations/print', payload, {
      responseType: 'blob'
    })

    // ... el resto del código sigue igual

    // 2. Creamos el objeto URL y forzamos la descarga
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `recibo_donativo_${Date.now()}.pdf`)
    document.body.appendChild(link)
    link.click()

    // 3. Limpieza
    link.parentNode.removeChild(link)
    window.URL.revokeObjectURL(url)

    notify.positive('Donativo registrado y Ticket generado.')
    dialog.value = false
  } catch (error) {
    console.error('Error al generar PDF:', error)
    notify.negative('Error al guardar o generar el PDF')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    donor_id: null,
    fiscal_record_id: null,
    procuration_activity_id: null,
    activity_type: '',
    concept: '',
    payment_date: date.formatDate(Date.now(), 'YYYY-MM-DD'),
    payment_method: 'Efectivo',
    currency: 'MXN',
    amount: 0,
    exchange_rate: 1,
    reference: '',
    has_tax_receipt: false,
    tax_receipt_number: '',
    piggy_bank_location: '',
    project_name: '',
    boteo_area: '',
    boteo_can_number: '',
    boteo_ten_percent: 0,
    government_institution_name: '',
    beneficiary_id: null,
    external_name: '',
    group_name: ''
  }
  donorOptions.value = []
  beneficiaryOptions.value = []
  fiscalOptions.value = []
  filteredActivities.value = []
  errors.value = {}
}

// Función para traer el tipo de cambio actual desde internet de forma automática
async function autoFetchExchangeRate() {
  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD')
    const data = await response.json()
    if (data && data.rates && data.rates.MXN) {
      form.value.exchange_rate = parseFloat(data.rates.MXN.toFixed(2))
    }
  } catch (error) {
    console.error('No se pudo precargar el tipo de cambio automático:', error)
    // Si falla internet, dejamos el valor por defecto en 1 para evitar errores
  }
}

// Detecta cambios en Monto, Tipo de Cambio y Moneda
watch(
  [() => form.value.amount, () => form.value.exchange_rate, () => form.value.currency],
  ([amount, rate, currency], [, , oldCurrency]) => {
    // Si el usuario acaba de cambiar la moneda de MXN a DLLS, disparamos la consulta automática
    if (currency === 'DLLS' && oldCurrency !== 'DLLS') {
      autoFetchExchangeRate()
    }

    // Realizamos el cálculo de la equivalencia en pesos
    if (currency === 'DLLS') {
      form.value.equivalent_amount_mxn = (Number(amount || 0) * Number(rate || 1)).toFixed(2)
    } else {
      form.value.equivalent_amount_mxn = Number(amount || 0).toFixed(2)
    }
  }
)

defineExpose({ open })
</script>

<template>
  <q-dialog
    v-model="dialog"
    persistent
  >
    <q-card style="width: 800px; max-width: 95vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-weight-bold">Nueva Aplicación de Donativo</div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          v-close-popup
        />
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="save">
          <q-markup-table
            flat
            class="donation-form-table"
          >
            <tbody>
              <tr>
                <td class="text-bold">Donante</td>
                <td>
                  <q-select
                    v-model="form.donor_id"
                    use-input
                    clearable
                    input-debounce="300"
                    outlined
                    dense
                    placeholder="Escriba para buscar un donante..."
                    :options="donorOptions"
                    option-label="full_name"
                    @filter="filterDonors"
                    :error="!!errors.donor_id"
                    :error-message="errors.donor_id?.[0]"
                    hide-bottom-space
                  >
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label>
                            {{ scope.opt.full_name }}
                            <q-badge :color="scope.opt.origin === 'donante' ? 'primary' : 'orange'">
                              {{ scope.opt.origin === 'donante' ? 'Donante' : 'Padrino' }}
                            </q-badge>
                          </q-item-label>

                          <!-- Solo mostramos registros fiscales si es Donante -->
                          <q-item-label
                            caption
                            v-if="
                              scope.opt.origin === 'donante' && scope.opt.fiscal_records?.length
                            "
                          >
                            Contiene {{ scope.opt.fiscal_records.length }} registro(s) fiscal(es)
                          </q-item-label>
                          <q-item-label
                            caption
                            v-else-if="scope.opt.origin === 'donante'"
                            class="text-amber-9"
                          >
                            Sin registros fiscales
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                    <template v-slot:selected-item="scope">
                      <span v-if="scope.opt">{{ scope.opt.full_name }}</span>
                    </template>
                  </q-select>
                </td>
              </tr>

              <tr>
                <td class="text-bold">RFC / Razón Social</td>
                <td>
                  <q-select
                    v-model="form.fiscal_record_id"
                    outlined
                    dense
                    clearable
                    :options="fiscalOptions"
                    option-value="id"
                    option-label="tax_name"
                    map-options
                    emit-value
                    :disable="!form.donor_id || fiscalOptions.length === 0"
                    :placeholder="
                      !form.donor_id
                        ? 'Primero seleccione un donante...'
                        : fiscalOptions.length === 0
                          ? 'Este donante no tiene datos fiscales'
                          : 'Seleccione una razón social...'
                    "
                    :bg-color="!form.donor_id || fiscalOptions.length === 0 ? 'grey-2' : 'white'"
                    hide-bottom-space
                  >
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label class="text-weight-medium">{{
                            scope.opt.commercial_name || scope.opt.tax_name
                          }}</q-item-label>
                          <q-item-label caption>RFC: {{ scope.opt.rfc }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                    <template v-slot:selected-item="scope">
                      <span class="text-ellipsis">
                        <strong>RFC: {{ scope.opt.rfc }}</strong> —
                        {{ scope.opt.commercial_name || scope.opt.tax_name }}
                      </span>
                    </template>
                  </q-select>
                </td>
              </tr>

              <tr>
                <td class="text-bold">Tipo de Actividad</td>
                <td>
                  <q-select
                    v-model="form.activity_type"
                    outlined
                    dense
                    :options="activityTypes"
                    hide-bottom-space
                  />
                </td>
              </tr>

              <tr>
                <td class="text-bold">Actividad Específica</td>
                <td>
                  <q-select
                    v-model="form.procuration_activity_id"
                    outlined
                    dense
                    :options="filteredActivities"
                    option-label="name"
                    option-value="id"
                    map-options
                    emit-value
                    :disable="!form.activity_type"
                    placeholder="Seleccione la actividad..."
                    hide-bottom-space
                  />
                </td>
              </tr>

              <tr v-if="form.activity_type === 'Alcancía'">
                <td class="text-bold">Ubicada en</td>
                <td>
                  <q-input
                    v-model="form.piggy_bank_location"
                    outlined
                    dense
                    placeholder="Nombre del establecimiento"
                    hide-bottom-space
                  />
                </td>
              </tr>

              <template v-if="form.activity_type === 'Boteo'">
                <tr>
                  <td class="text-bold">Área de Boteo</td>
                  <td>
                    <q-input
                      v-model="form.boteo_area"
                      outlined
                      dense
                      placeholder="Escriba el área de recolección"
                      hide-bottom-space
                    />
                  </td>
                </tr>
                <tr>
                  <td class="text-bold">No. de Bote / 10%</td>
                  <td>
                    <div class="row q-col-gutter-sm">
                      <q-input
                        v-model="form.boteo_can_number"
                        outlined
                        dense
                        placeholder="No. de Bote"
                        class="col-6"
                        hide-bottom-space
                      />
                      <q-input
                        v-model="form.boteo_ten_percent"
                        outlined
                        dense
                        placeholder="10% (Autocalculado)"
                        readonly
                        class="col-6"
                        bg-color="grey-2"
                        hide-bottom-space
                      />
                    </div>
                  </td>
                </tr>
              </template>

              <tr v-if="form.activity_type === 'Alianza' || form.activity_type === 'Fundaciones'">
                <td class="text-bold">Proyecto</td>
                <td>
                  <q-input
                    v-model="form.project_name"
                    outlined
                    dense
                    placeholder="Nombre del proyecto asignado"
                    hide-bottom-space
                  />
                </td>
              </tr>

              <template
                v-if="
                  form.activity_type === 'Programa de Verano' || form.activity_type === 'Natación'
                "
              >
                <tr>
                  <td class="text-bold">Beneficiario</td>
                  <td>
                    <q-select
                      v-model="form.beneficiary_id"
                      use-input
                      clearable
                      input-debounce="300"
                      outlined
                      dense
                      placeholder="Escriba el nombre del beneficiario..."
                      :options="beneficiaryOptions"
                      option-value="id"
                      option-label="label"
                      emit-value
                      map-options
                      @filter="filterBeneficiaries"
                      hide-bottom-space
                    >
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{ scope.opt.label }}</q-item-label>
                          </q-item-section>
                        </q-item>
                      </template>
                      <template v-slot:selected-item="scope">
                        <span v-if="scope.opt">{{ scope.opt.label }}</span>
                      </template>
                    </q-select>
                  </td>
                </tr>
                <tr>
                  <td class="text-bold">Nombre Externo</td>
                  <td>
                    <q-input
                      v-model="form.external_name"
                      outlined
                      dense
                      placeholder="Nombre de la persona externa"
                      hide-bottom-space
                    />
                  </td>
                </tr>
                <tr>
                  <td class="text-bold">Grupo</td>
                  <td>
                    <q-input
                      v-model="form.group_name"
                      outlined
                      dense
                      placeholder="Asigne el grupo o clase"
                      hide-bottom-space
                    />
                  </td>
                </tr>
              </template>

              <tr v-if="form.activity_type === 'Organismos de Gobierno'">
                <td class="text-bold">Nombre de Institución</td>
                <td>
                  <q-input
                    v-model="form.government_institution_name"
                    outlined
                    dense
                    placeholder="Secretaría, Dirección o dependencia estatal"
                    hide-bottom-space
                  />
                </td>
              </tr>

              <tr>
                <td class="text-bold">Concepto</td>
                <td>
                  <q-input
                    v-model="form.concept"
                    outlined
                    dense
                    type="textarea"
                    rows="2"
                    hide-bottom-space
                  />
                </td>
              </tr>
              <tr>
                <td class="text-bold">Fecha / Método</td>
                <td>
                  <div class="row q-col-gutter-xs">
                    <q-input
                      v-model="form.payment_date"
                      outlined
                      dense
                      type="date"
                      class="col-6"
                      hide-bottom-space
                    />
                    <q-select
                      v-model="form.payment_method"
                      outlined
                      dense
                      :options="paymentMethods"
                      class="col-6"
                      hide-bottom-space
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td class="text-bold">Monto / Moneda</td>
                <td>
                  <div class="row q-col-gutter-xs">
                    <q-input
                      v-model.number="form.amount"
                      outlined
                      dense
                      type="number"
                      step="0.01"
                      prefix="$"
                      class="col-6"
                      hide-bottom-space
                    />
                    <q-select
                      v-model="form.currency"
                      outlined
                      dense
                      :options="['MXN', 'DLLS']"
                      class="col-6"
                      hide-bottom-space
                    />
                  </div>
                </td>
              </tr>
              <tr v-if="form.currency === 'DLLS'">
                <td class="text-bold">Tipo de Cambio</td>
                <td>
                  <div class="row q-col-gutter-xs items-center">
                    <!-- Input del Tipo de cambio (Se llena solo al cambiar a DLLS) -->
                    <q-input
                      v-model.number="form.exchange_rate"
                      outlined
                      dense
                      type="number"
                      step="0.01"
                      class="col-6"
                      hide-bottom-space
                    />

                    <!-- Input de Equivalencia en Pesos -->
                    <q-input
                      :model-value="form.equivalent_amount_mxn"
                      outlined
                      dense
                      readonly
                      prefix="Equiv. Pesos: $"
                      bg-color="orange-1"
                      class="col-6 text-weight-bold text-orange-9"
                      hide-bottom-space
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <td class="text-bold">Referencia</td>
                <td>
                  <q-input
                    v-model="form.reference"
                    outlined
                    dense
                    placeholder="No. de operación o cheque"
                    hide-bottom-space
                  />
                </td>
              </tr>

              <tr>
                <td class="text-bold">¿Deducible?</td>
                <td class="flex items-center">
                  <q-checkbox
                    v-model="form.has_tax_receipt"
                    label="Sí, requiere recibo"
                  />
                  <q-input
                    v-if="form.has_tax_receipt"
                    v-model="form.tax_receipt_number"
                    outlined
                    dense
                    placeholder="No. de Recibo"
                    class="q-ml-md"
                    hide-bottom-space
                  />
                </td>
              </tr>
            </tbody>
          </q-markup-table>

          <div class="flex justify-end q-mt-md q-gutter-x-sm">
            <q-btn
              flat
              label="Cancelar"
              v-close-popup
            />

            <q-btn
              unelevated
              icon="print"
              label="Guardar e Imprimir"
              color="primary"
              @click="saveAndPrint"
              :loading="loading"
            />

            <!-- <q-btn
              unelevated
              icon="save"
              label="Guardar"
              color="primary"
              @click="save"
              :loading="loading"
            /> -->
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style lang="scss">
.donation-form-table {
  tbody tr {
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  }
  tbody td:first-child {
    width: 180px;
    background-color: #f8f9fa;
    vertical-align: middle;
  }
}
.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 550px;
}
</style>

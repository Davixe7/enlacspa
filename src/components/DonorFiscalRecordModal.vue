<script setup>
import { ref } from 'vue'

const emit = defineEmits(['accept'])
const isOpen = ref(false)
const editingIndex = ref(null)

const form = ref(getCleanFiscalForm())
// Guarda los arrays de errores indexados por el nombre del campo que envíe el backend
const serverErrors = ref({})

function getCleanFiscalForm() {
  return {
    id: null,
    commercial_name: '',
    tax_name: '',
    rfc: '',
    tax_regimen: '',
    cfdi_use: '',
    email: '',
    company_anniversary: '',
    street: '',
    exterior_number: '',
    neighborhood: '',
    postal_code: '',
    city: '',
    state: '',
    billing_contact_name: '',
    billing_job_title: '',
    billing_landline: '',
    billing_cellphone: '',
    billing_email: '',
    billing_birth_date: '',
    home_collection: false,
    payment_day: '',
    billing_street: '',
    billing_exterior_number: '',
    billing_neighborhood: '',
    billing_postal_code: ''
  }
}

const taxRegimens = [
  '601 - General de Ley Personas Morales',
  '603 - Personas Morales con Fines no Lucrativos',
  '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios',
  '606 - Arrendamiento',
  '607 - Régimen de Enajenación o Adquisición de Bienes',
  '608 - Demás ingresos',
  '610 - Residentes en el Extranjero sin Establecimiento Permanente en México',
  '611 - Ingresos por Dividendos (socios y accionistas)',
  '612 - Personas Físicas con Actividades Empresariales y Profesionales',
  '614 - Ingresos por intereses',
  '615 - Régimen de los ingresos por obtención de premios',
  '616 - Sin obligaciones fiscales',
  '620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos',
  '621 - Incorporación Fiscal',
  '622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras',
  '623 - Opcional para Grupos de Sociedades',
  '624 - Coordinados',
  '625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas',
  '626 - Régimen Simplificado de Confianza'
]

const cfdiUses = [
  'G01 - Adquisición de mercancías',
  'G02 - Devoluciones, descuentos o bonificaciones',
  'G03 - Gastos en general',
  'I01 - Construcciones',
  'I02 - Mobiliario y equipo de oficina por inversiones',
  'I03 - Equipo de transporte',
  'I04 - Equipo de cómputo y accesorios',
  'I05 - Dados, troqueles, moldes, matrices y herramental',
  'I06 - Comunicaciones telefónicas',
  'I07 - Comunicaciones satelitales',
  'I08 - Otra maquinaria y equipo',
  'D01 - Honorarios médicos, dentales y gastos hospitalarios',
  'D02 - Gastos médicos por incapacidad o discapacidad',
  'D03 - Gastos funerales',
  'D04 - Donativos',
  'D05 - Intereses reales efectivamente pagados por créditos hipotecarios (casa habitación)',
  'D06 - Aportaciones voluntarias al SAR',
  'D07 - Primas por seguros de gastos médicos',
  'D08 - Gastos de transportación escolar obligatoria',
  'D09 - Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones',
  'D10 - Pagos por servicios educativos (colegiaturas)',
  'S01 - Sin efectos fiscales',
  'CP01 - Pagos',
  'CN01 - Nómina'
]

function open(data = null, index = null) {
  editingIndex.value = index
  serverErrors.value = {} // Limpiar errores previos al abrir
  if (data) {
    form.value = { ...getCleanFiscalForm(), ...data }
  } else {
    form.value = getCleanFiscalForm()
  }
  isOpen.value = true
}

// Extrae el primer mensaje de error de manera segura asegurando el tipo de dato
function getFieldError(field) {
  const error = serverErrors.value[field]
  if (!error) return ''
  return Array.isArray(error) ? error[0] : error
}

// Inyecta los errores desde la petición externa en DonorDetail
function setServerErrors(errors) {
  serverErrors.value = errors || {}
}

// Cierra la modal una vez que el guardado sea exitoso externamente
function closeModal() {
  isOpen.value = false
}

function submit() {
  emit('accept', {
    data: form.value,
    index: editingIndex.value,
    closeModal,
    setErrors: setServerErrors
  })
}

// Limpia el estado de error de un input individual apenas el usuario modifique su valor
function clearFieldError(field) {
  if (serverErrors.value[field]) {
    delete serverErrors.value[field]
  }
}

defineExpose({ open })
</script>

<template>
  <q-dialog
    v-model="isOpen"
    persistent
  >
    <q-card style="width: 750px; max-width: 90vw">
      <q-form @submit.prevent="submit">
        <input
          type="hidden"
          v-model="form.donor_id"
        />
        <q-card-section class="bg-primary text-white q-py-sm flex items-center">
          <div class="text-subtitle1 text-weight-bold">
            {{
              editingIndex !== null ? 'Editar Registro Fiscal' : 'Nuevo Registro Fiscal y Cobranza'
            }}
          </div>
          <q-btn
            flat
            round
            icon="sym_o_close"
            class="q-ml-auto"
            v-close-popup
          />
        </q-card-section>

        <q-card-section
          style="max-height: 60vh"
          class="scroll q-pa-none"
        >
          <q-markup-table
            flat
            class="system-form-table"
          >
            <tbody>
              <tr class="bg-grey-2">
                <td
                  colspan="2"
                  class="text-subtitle2 text-weight-bold text-grey-9"
                >
                  Razones / Denominaciones Sociales (Datos Fiscales)
                </td>
              </tr>
              <tr>
                <td>Nombre Comercial *</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.commercial_name"
                    :error="!!serverErrors.commercial_name"
                    :error-message="getFieldError('commercial_name')"
                    :hide-bottom-space="!serverErrors.commercial_name"
                    @update:model-value="clearFieldError('commercial_name')"
                  />
                </td>
              </tr>
              <tr>
                <td>Razón / Denominación *</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.tax_name"
                    :error="!!serverErrors.tax_name"
                    :error-message="getFieldError('tax_name')"
                    :hide-bottom-space="!serverErrors.tax_name"
                    @update:model-value="clearFieldError('tax_name')"
                  />
                </td>
              </tr>
              <tr>
                <td>RFC *</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.rfc"
                    style="text-transform: uppercase"
                    @update:model-value="
                      (val) => {
                        form.rfc = val.toUpperCase().replace(/[^A-Z0-9&]/g, '')
                        clearFieldError('rfc')
                      }
                    "
                    maxlength="13"
                    placeholder="Ej: EM120324XX1"
                    :error="!!serverErrors.rfc"
                    :error-message="getFieldError('rfc')"
                    :hide-bottom-space="!serverErrors.rfc"
                  />
                </td>
              </tr>
              <tr>
                <td>Régimen Fiscal *</td>
                <td>
                  <q-select
                    outlined
                    dense
                    v-model="form.tax_regimen"
                    :options="taxRegimens"
                    :error="!!serverErrors.tax_regimen"
                    :error-message="getFieldError('tax_regimen')"
                    :hide-bottom-space="!serverErrors.tax_regimen"
                    @update:model-value="clearFieldError('tax_regimen')"
                  />
                </td>
              </tr>
              <tr>
                <td>Uso de CFDI *</td>
                <td>
                  <q-select
                    outlined
                    dense
                    v-model="form.cfdi_use"
                    :options="cfdiUses"
                    :error="!!serverErrors.cfdi_use"
                    :error-message="getFieldError('cfdi_use')"
                    :hide-bottom-space="!serverErrors.cfdi_use"
                    @update:model-value="clearFieldError('cfdi_use')"
                  />
                </td>
              </tr>
              <tr>
                <td>Correo Electrónico *</td>
                <td>
                  <q-input
                    outlined
                    dense
                    type="email"
                    v-model="form.email"
                    :error="!!serverErrors.email"
                    :error-message="getFieldError('email')"
                    :hide-bottom-space="!serverErrors.email"
                    @update:model-value="clearFieldError('email')"
                  />
                </td>
              </tr>
              <tr>
                <td>Aniversario Empresa</td>
                <td>
                  <q-input
                    outlined
                    dense
                    type="date"
                    v-model="form.company_anniversary"
                    :error="!!serverErrors.company_anniversary"
                    :error-message="getFieldError('company_anniversary')"
                    :hide-bottom-space="!serverErrors.company_anniversary"
                    @update:model-value="clearFieldError('company_anniversary')"
                  />
                </td>
              </tr>
              <tr>
                <td>Calle Fiscal *</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.street"
                    :error="!!serverErrors.street"
                    :error-message="getFieldError('street')"
                    :hide-bottom-space="!serverErrors.street"
                    @update:model-value="clearFieldError('street')"
                  />
                </td>
              </tr>
              <tr>
                <td>Núm. Exterior *</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.exterior_number"
                    :error="!!serverErrors.exterior_number"
                    :error-message="getFieldError('exterior_number')"
                    :hide-bottom-space="!serverErrors.exterior_number"
                    @update:model-value="clearFieldError('exterior_number')"
                  />
                </td>
              </tr>
              <tr>
                <td>Colonia Fiscal *</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.neighborhood"
                    :error="!!serverErrors.neighborhood"
                    :error-message="getFieldError('neighborhood')"
                    :hide-bottom-space="!serverErrors.neighborhood"
                    @update:model-value="clearFieldError('neighborhood')"
                  />
                </td>
              </tr>
              <tr>
                <td>C.P. Fiscal *</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.postal_code"
                    :error="!!serverErrors.postal_code"
                    :error-message="getFieldError('postal_code')"
                    :hide-bottom-space="!serverErrors.postal_code"
                    @update:model-value="clearFieldError('postal_code')"
                  />
                </td>
              </tr>
              <tr>
                <td>Ciudad *</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.city"
                    :error="!!serverErrors.city"
                    :error-message="getFieldError('city')"
                    :hide-bottom-space="!serverErrors.city"
                    @update:model-value="clearFieldError('city')"
                  />
                </td>
              </tr>
              <tr>
                <td>Estado *</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.state"
                    :error="!!serverErrors.state"
                    :error-message="getFieldError('state')"
                    :hide-bottom-space="!serverErrors.state"
                    @update:model-value="clearFieldError('state')"
                  />
                </td>
              </tr>

              <tr class="bg-grey-3">
                <td
                  colspan="2"
                  class="text-subtitle2 text-weight-bold text-grey-9"
                >
                  Datos de Cobranza
                </td>
              </tr>
              <tr>
                <td>Contacto Cobranza *</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.billing_contact_name"
                    :error="!!serverErrors.billing_contact_name"
                    :error-message="getFieldError('billing_contact_name')"
                    :hide-bottom-space="!serverErrors.billing_contact_name"
                    @update:model-value="clearFieldError('billing_contact_name')"
                  />
                </td>
              </tr>
              <tr>
                <td>Puesto / Ocupación</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.billing_job_title"
                    :error="!!serverErrors.billing_job_title"
                    :error-message="getFieldError('billing_job_title')"
                    :hide-bottom-space="!serverErrors.billing_job_title"
                    @update:model-value="clearFieldError('billing_job_title')"
                  />
                </td>
              </tr>
              <tr>
                <td>Teléfono Fijo</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.billing_landline"
                    :error="!!serverErrors.billing_landline"
                    :error-message="getFieldError('billing_landline')"
                    :hide-bottom-space="!serverErrors.billing_landline"
                    @update:model-value="clearFieldError('billing_landline')"
                  />
                </td>
              </tr>
              <tr>
                <td>Celular Cobranza</td>
                <td>
                  <q-input
                    outlined
                    dense
                    mask="##########"
                    v-model="form.billing_cellphone"
                    :error="!!serverErrors.billing_cellphone"
                    :error-message="getFieldError('billing_cellphone')"
                    :hide-bottom-space="!serverErrors.billing_cellphone"
                    @update:model-value="clearFieldError('billing_cellphone')"
                  />
                </td>
              </tr>
              <tr>
                <td>Correo Cobranza</td>
                <td>
                  <q-input
                    outlined
                    dense
                    type="email"
                    v-model="form.billing_email"
                    :error="!!serverErrors.billing_email"
                    :error-message="getFieldError('billing_email')"
                    :hide-bottom-space="!serverErrors.billing_email"
                    @update:model-value="clearFieldError('billing_email')"
                  />
                </td>
              </tr>
              <tr>
                <td>Cumpleaños Contacto</td>
                <td>
                  <q-input
                    outlined
                    dense
                    type="date"
                    v-model="form.billing_birth_date"
                    :error="!!serverErrors.billing_birth_date"
                    :error-message="getFieldError('billing_birth_date')"
                    :hide-bottom-space="!serverErrors.billing_birth_date"
                    @update:model-value="clearFieldError('billing_birth_date')"
                  />
                </td>
              </tr>
              <tr>
                <td>¿Cobro a domicilio?</td>
                <td>
                  <q-checkbox
                    v-model="form.home_collection"
                    label="Sí, requiere cobro físico en sitio"
                    color="secondary"
                  />
                </td>
              </tr>
              <tr>
                <td>Día Preferente Pago</td>
                <td>
                  <q-input
                    outlined
                    dense
                    placeholder="Ej. Lunes o Quincena"
                    v-model="form.payment_day"
                    :error="!!serverErrors.payment_day"
                    :error-message="getFieldError('payment_day')"
                    :hide-bottom-space="!serverErrors.payment_day"
                    @update:model-value="clearFieldError('payment_day')"
                  />
                </td>
              </tr>

              <tr class="bg-grey-3">
                <td
                  colspan="2"
                  class="text-subtitle2 text-weight-bold text-grey-9"
                >
                  Domicilio Alterno de Cobranza (Opcional)
                </td>
              </tr>
              <tr>
                <td>Calle Cobranza</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.billing_street"
                    :error="!!serverErrors.billing_street"
                    :error-message="getFieldError('billing_street')"
                    :hide-bottom-space="!serverErrors.billing_street"
                    @update:model-value="clearFieldError('billing_street')"
                  />
                </td>
              </tr>
              <tr>
                <td>Num Exterior Cobranza</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.billing_exterior_number"
                    :error="!!serverErrors.billing_exterior_number"
                    :error-message="getFieldError('billing_exterior_number')"
                    :hide-bottom-space="!serverErrors.billing_exterior_number"
                    @update:model-value="clearFieldError('billing_exterior_number')"
                  />
                </td>
              </tr>
              <tr>
                <td>Colonia Cobranza</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.billing_neighborhood"
                    :error="!!serverErrors.billing_neighborhood"
                    :error-message="getFieldError('billing_neighborhood')"
                    :hide-bottom-space="!serverErrors.billing_neighborhood"
                    @update:model-value="clearFieldError('billing_neighborhood')"
                  />
                </td>
              </tr>
              <tr>
                <td>C.P. Cobranza</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.billing_postal_code"
                    :error="!!serverErrors.billing_postal_code"
                    :error-message="getFieldError('billing_postal_code')"
                    :hide-bottom-space="!serverErrors.billing_postal_code"
                    @update:model-value="clearFieldError('billing_postal_code')"
                  />
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </q-card-section>

        <q-separator />
        <q-card-actions
          align="right"
          class="q-pa-md"
        >
          <q-btn
            flat
            label="Cancelar"
            color="grey"
            v-close-popup
          />
          <q-btn
            type="submit"
            color="primary"
            icon="sym_o_check_circle"
            label="Aceptar"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

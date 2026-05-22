<script setup>
import { ref } from 'vue'

const emit = defineEmits(['accept'])
const isOpen = ref(false)
const editingIndex = ref(null)

const form = ref(getCleanFiscalForm())

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
    exterior_number: '', // Cambiado de external_number a exterior_number
    neighborhood: '',
    postal_code: '',
    city: '',
    state: '',
    // Datos de Cobranza unificados con el Backend (prefijo billing_)
    billing_contact_name: '', // Cambiado de contact_name
    billing_job_title: '', // Cambiado de position
    billing_landline: '', // Cambiado de phone
    billing_cellphone: '', // Cambiado de cellphone
    billing_email: '', // Cambiado de collection_email
    billing_birth_date: '',
    home_collection: false,
    payment_day: '',
    billing_street: '', // Cambiado de collection_street
    billing_exterior_number: '', // Cambiado de collection_external_number
    billing_neighborhood: '', // Cambiado de collection_neighborhood
    billing_postal_code: '' // Cambiado de collection_postal_code
  }
}

const taxRegimens = [
  '601 - General Morales',
  '603 - Fines no Lucrativos',
  '605 - Sueldos y Salarios',
  '612 - Actividades Empresariales',
  '626 - RESICO'
]

const cfdiUses = [
  'G01 - Adquisición de mercancías',
  'G03 - Gastos en general',
  'I02 - Mobiliario',
  'D04 - Donativos'
]

function open(data = null, index = null) {
  editingIndex.value = index
  if (data) {
    form.value = { ...getCleanFiscalForm(), ...data }
  } else {
    form.value = getCleanFiscalForm()
  }
  isOpen.value = true
}

function submit() {
  emit('accept', { data: form.value, index: editingIndex.value })
  isOpen.value = false
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
        <q-card-section class="bg-secondary text-white q-py-sm flex items-center">
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
                    hide-bottom-space
                    required
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
                    hide-bottom-space
                    required
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
                    mask="############"
                    hide-bottom-space
                    style="text-transform: uppercase"
                    required
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
                    hide-bottom-space
                    required
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
                    hide-bottom-space
                    required
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
                    hide-bottom-space
                    required
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
                    hide-bottom-space
                  />
                </td>
              </tr>
              <tr>
                <td>Calle Fiscal</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.street"
                    hide-bottom-space
                  />
                </td>
              </tr>
              <tr>
                <td>Núm. Exterior</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.exterior_number"
                    hide-bottom-space
                  />
                </td>
              </tr>
              <tr>
                <td>Colonia Fiscal</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.neighborhood"
                    hide-bottom-space
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
                    hide-bottom-space
                    required
                  />
                </td>
              </tr>
              <tr>
                <td>Ciudad</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.city"
                    hide-bottom-space
                  />
                </td>
              </tr>
              <tr>
                <td>Estado</td>
                <td>
                  <q-input
                    outlined
                    dense
                    v-model="form.state"
                    hide-bottom-space
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
                    hide-bottom-space
                    required
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
                    hide-bottom-space
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
                    hide-bottom-space
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
                    hide-bottom-space
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
                    hide-bottom-space
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
                    hide-bottom-space
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
                    hide-bottom-space
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
                    hide-bottom-space
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
                    hide-bottom-space
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
                    hide-bottom-space
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
                    hide-bottom-space
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
            color="secondary"
            icon="sym_o_check_circle"
            label="Aceptar Cuenta"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'
import DonorFiscalRecordModal from './DonorFiscalRecordModal.vue'

const emit = defineEmits(['saved'])
const isOpen = ref(false)
const activeTab = ref('personal')
const loading = ref(false)
const errors = ref({})

const fiscalRecordModalRef = ref(null)
const form = ref(getCleanForm())

function getCleanForm() {
  return {
    id: null,
    donor_type: 'Físico',
    first_name: '',
    last_name: '', // Unificado (Apellido Paterno)
    second_last_name: '', // Unificado (Apellido Materno)
    preferred_name: '', // Unificado (Le gusta que le llamen)
    marital_status: 'Desconocido',
    gender: 'Masculino', // Unificado (Sexo)
    birth_date: '', // Unificado
    cellphone: '',
    landline: '', // Unificado (Teléfono Fijo)
    personal_email: '', // Unificado
    knows_facilities: 'No',
    sector: 'Cuauhtémoc',
    spouse_first_name: '',
    spouse_last_name: '', // Unificado
    spouse_second_last_name: '', // Unificado
    spouse_birth_date: '', // Unificado
    wedding_anniversary: '', // Unificado
    street: '',
    exterior_number: '', // Unificado
    neighborhood: '',
    postal_code: '',
    city: '',
    state: '',
    country: 'México',
    company_name: '', // Unificado (Empresa)
    job_title: '', // Unificado (Puesto)
    contact_restrictions: '',
    referred_by: '', // Unificado (Persona que nos conectó)
    referral_relationship: '', // Unificado (Relación)
    notes: '', // Unificado (Observaciones)
    is_private_contact: 0,
    prospect_for: [],
    is_active: 1,
    fiscal_records: []
  }
}

const maritalOptions = [
  'Soltero(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viudo(a)',
  'Unión Libre',
  'Desconocido'
]
const sectorOptions = [
  'Cuauhtémoc',
  'Corredor Comercial',
  'Ojo de la Yegua',
  'Jagüeyes',
  'Oasis',
  'Villa Ahumada',
  'Otro'
]

const prospectOptions = [
  'Alcancía',
  'Fundaciones',
  'Programa de Verano',
  'Alianza',
  'Natación',
  'Proyecto Interno',
  'Boteo',
  'Obsequio entre Amigos',
  'Radiomaratón',
  'Donativos Varios',
  'Organismos de Gobierno'
]

function open(rowData = null) {
  errors.value = {}
  activeTab.value = 'personal'

  if (rowData) {
    form.value = {
      ...getCleanForm(),
      ...rowData,
      birth_date: rowData.birth_date ? rowData.birth_date.split('T')[0] : '',
      spouse_birth_date: rowData.spouse_birth_date ? rowData.spouse_birth_date.split('T')[0] : '',
      is_private_contact: rowData.is_private_contact ? 1 : 0,
      prospect_for: Array.isArray(rowData.prospect_for) ? rowData.prospect_for : [],
      knows_facilities: rowData.knows_facilities ? 'SÍ' : 'No',

      // Forzamos a que si viene desde el backend como fiscal_records, se asigne correctamente,
      // y si viene nulo o indefinido, inicialice como un array vacío para que el v-for no falle.
      fiscal_records: rowData.fiscal_records || rowData.fiscal_records || []
    }
  } else {
    form.value = getCleanForm()
  }
  isOpen.value = true
}

function openAddFiscal() {
  fiscalRecordModalRef.value.open()
}

function openEditFiscal(index) {
  fiscalRecordModalRef.value.open(form.value.fiscal_records[index], index)
}

function removeFiscal(index) {
  form.value.fiscal_records.splice(index, 1)
}

async function handleFiscalAccept({ data, index, closeModal, setErrors }) {
  try {
    let response

    if (!data.donor_id && form.value.id) {
      data.donor_id = form.value.id
    }

    if (data.id) {
      response = await api.put(`/fiscal-records/${data.id}`, data)
      notify.positive('Registro fiscal actualizado con éxito')
    } else if (data.donor_id) {
      response = await api.post('/fiscal-records', data)
      notify.positive('Registro fiscal creado con éxito')
    } else {
      // Donante nuevo (Pasa aquí tras validar de forma segura en el front)
      if (index !== null) {
        form.value.fiscal_records[index] = { ...data }
      } else {
        form.value.fiscal_records.push({ ...data })
      }
      if (closeModal) closeModal()
      return
    }

    const savedRecord = response.data?.data || response.data
    if (index !== null) {
      form.value.fiscal_records[index] = savedRecord
    } else {
      form.value.fiscal_records.push(savedRecord)
    }

    if (closeModal) closeModal()
  } catch (error) {
    if (error.response && error.response.status === 422) {
      const serverErrors = error.response.data.errors || {}
      if (typeof setErrors === 'function') {
        setErrors({ ...serverErrors })
      }
      notify.negative('Por favor, verifica los campos obligatorios del registro fiscal.')
    } else {
      const msg = error.response?.data?.message || 'Error al procesar el registro fiscal.'
      notify.negative(msg)
    }
  }
}

async function save() {
  try {
    loading.value = true
    errors.value = {}
    let route = form.value.id ? `/donors/${form.value.id}` : '/donors'

    let data = {
      ...form.value,
      _method: form.value.id ? 'PUT' : undefined
    }

    const response = await api.post(route, data)
    notify.positive('Kardex del Donante procesado correctamente')
    emit('saved', response.data)
    isOpen.value = false
  } catch (error) {
    if (error.response?.status === 422) {
      const serverErrors = error.response.data.errors || {}

      // Mapeo seguro de errores
      Object.keys(serverErrors).forEach((key) => {
        const errorVal = serverErrors[key]
        // Si es un array, tomamos el primer elemento. Si ya es un string, lo dejamos pasar completo.
        errors.value[key] = Array.isArray(errorVal) ? errorVal[0] : errorVal
      })

      notify.negative('Te falta información por capturar o revisar en las pestañas')
      focusTabWithError(Object.keys(serverErrors))
    } else {
      // Por si llega a fallar la base de datos de nuevo, capturamos el mensaje real aquí
      const dbMessage = error.response?.data?.message || 'Ocurrió un error al guardar el Kardex'
      notify.negative(dbMessage)
    }
  } finally {
    loading.value = false
  }
}

// Función auxiliar para redirigir al usuario a la pestaña rota
function focusTabWithError(errorKeys) {
  // Campos obligatorios por pestaña según tu formulario actual
  const personalFields = ['first_name', 'last_name', 'cellphone', 'sector']
  const workFields = ['contact_restrictions']

  // Si hay un error en la primera pestaña, priorizamos llevarlo ahí
  if (errorKeys.some((key) => personalFields.includes(key))) {
    activeTab.value = 'personal'
  }
  // Si los datos personales están bien pero falta el estatus/restricciones laborales, lo movemos a la 3
  else if (errorKeys.some((key) => workFields.includes(key))) {
    activeTab.value = 'work'
  }
}

defineExpose({ open })
</script>

<template>
  <q-dialog
    v-model="isOpen"
    persistent
  >
    <q-card style="width: 900px; max-width: 95vw">
      <q-card-section class="bg-primary text-white q-py-sm row items-center">
        <div class="text-h6 text-weight-bold">Kardex de Control General</div>
        <q-btn
          flat
          round
          icon="sym_o_close"
          class="q-ml-auto"
          v-close-popup
        />
      </q-card-section>

      <q-tabs
        v-model="activeTab"
        dense
        class="text-grey bg-grey-2"
        active-color="primary"
        indicator-color="primary"
        align="left"
      >
        <q-tab
          name="personal"
          label="1. Personales / Dom"
        />
        <q-tab
          name="spouse"
          label="2. Cónyuge"
          :disable="form.donor_type === 'Moral'"
        />
        <q-tab
          name="work"
          label="3. Laboral / Estatus"
        />
        <q-tab
          name="fiscal"
          label="4. Fiscales / Cobranza"
        />
      </q-tabs>

      <q-separator />

      <q-form @submit.prevent="save">
        <q-card-section
          style="max-height: 65vh"
          class="scroll q-pa-sm"
        >
          <q-tab-panels
            v-model="activeTab"
            animated
          >
            <q-tab-panel
              name="personal"
              class="q-pa-none q-gutter-y-md"
            >
              <div class="row q-px-sm q-pt-sm">
                <q-option-group
                  v-model="form.donor_type"
                  :options="[
                    { label: 'Persona Física', value: 'Físico' },
                    { label: 'Persona Moral', value: 'Moral' }
                  ]"
                  inline
                  color="primary"
                />
              </div>

              <q-markup-table
                flat
                class="system-form-table"
              >
                <tbody>
                  <template v-if="form.donor_type === 'Físico'">
                    <tr>
                      <td>Nombre(s) *</td>
                      <td>
                        <q-input
                          outlined
                          dense
                          v-model="form.first_name"
                          :error="!!errors.first_name"
                          :error-message="errors.first_name"
                          hide-bottom-space
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Apellido Paterno *</td>
                      <td>
                        <q-input
                          outlined
                          dense
                          v-model="form.last_name"
                          :error="!!errors.last_name"
                          :error-message="errors.last_name"
                          hide-bottom-space
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Apellido Materno</td>
                      <td>
                        <q-input
                          outlined
                          dense
                          v-model="form.second_last_name"
                          :error="!!errors.second_last_name"
                          :error-message="errors.second_last_name"
                          hide-bottom-space
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Le gusta que le llamen</td>
                      <td>
                        <q-input
                          outlined
                          dense
                          v-model="form.preferred_name"
                          hide-bottom-space
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Estado Civil</td>
                      <td>
                        <q-select
                          outlined
                          dense
                          v-model="form.marital_status"
                          :options="maritalOptions"
                          hide-bottom-space
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Sexo</td>
                      <td>
                        <q-option-group
                          v-model="form.gender"
                          :options="[
                            { label: 'Masculino', value: 'Masculino' },
                            { label: 'Femenino', value: 'Femenino' }
                          ]"
                          inline
                          color="primary"
                        />
                      </td>
                    </tr>
                  </template>

                  <tr>
                    <td>Fecha de Nacimiento</td>
                    <td>
                      <q-input
                        outlined
                        dense
                        type="date"
                        v-model="form.birth_date"
                        hide-bottom-space
                        hint="DD/MM/AAAA"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Celular (10 dígitos) *</td>
                    <td>
                      <q-input
                        outlined
                        dense
                        mask="##########"
                        v-model="form.cellphone"
                        :error="!!errors.cellphone"
                        :error-message="errors.cellphone"
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
                        v-model="form.landline"
                        hide-bottom-space
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Correo Electrónico</td>
                    <td>
                      <q-input
                        outlined
                        dense
                        type="email"
                        v-model="form.personal_email"
                        hide-bottom-space
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>¿Conoce ENLAC?</td>
                    <td>
                      <q-option-group
                        v-model="form.knows_facilities"
                        :options="[
                          { label: 'SÍ', value: 'SÍ' },
                          { label: 'No', value: 'No' }
                        ]"
                        inline
                        color="primary"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Sector *</td>
                    <td>
                      <q-select
                        outlined
                        dense
                        v-model="form.sector"
                        :options="sectorOptions"
                        :error="!!errors.sector"
                        :error-message="errors.sector"
                        hide-bottom-space
                      />
                    </td>
                  </tr>

                  <tr class="bg-grey-2">
                    <td
                      colspan="2"
                      class="text-subtitle2 text-weight-bold"
                    >
                      Domicilio Particular del Donante
                    </td>
                  </tr>
                  <tr>
                    <td>Calle</td>
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
                    <td>Colonia</td>
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
                    <td>Código Postal</td>
                    <td>
                      <q-input
                        outlined
                        dense
                        v-model="form.postal_code"
                        hide-bottom-space
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
                  <tr>
                    <td>País</td>
                    <td>
                      <q-input
                        outlined
                        dense
                        v-model="form.country"
                        hide-bottom-space
                      />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-tab-panel>

            <q-tab-panel
              name="spouse"
              class="q-pa-none"
            >
              <q-markup-table
                flat
                class="system-form-table"
              >
                <tbody>
                  <tr>
                    <td>Nombre(s) Cónyuge</td>
                    <td>
                      <q-input
                        outlined
                        dense
                        v-model="form.spouse_first_name"
                        hide-bottom-space
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Apellido Paterno</td>
                    <td>
                      <q-input
                        outlined
                        dense
                        v-model="form.spouse_last_name"
                        hide-bottom-space
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Apellido Materno</td>
                    <td>
                      <q-input
                        outlined
                        dense
                        v-model="form.spouse_second_last_name"
                        hide-bottom-space
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Nacimiento Cónyuge</td>
                    <td>
                      <q-input
                        outlined
                        dense
                        type="date"
                        v-model="form.spouse_birth_date"
                        hide-bottom-space
                        hint="DD/MM/AAAA"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Aniversario Casados</td>
                    <td>
                      <q-input
                        outlined
                        dense
                        placeholder="MM-DD"
                        mask="##-##"
                        v-model="form.wedding_anniversary"
                        hide-bottom-space
                        hint="Mes y Día (MM-DD)"
                      />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-tab-panel>

            <q-tab-panel
              name="work"
              class="q-pa-none"
            >
              <q-markup-table
                flat
                class="system-form-table"
              >
                <tbody>
                  <tr>
                    <td>Empresa labora/representa</td>
                    <td>
                      <q-input
                        outlined
                        dense
                        v-model="form.company_name"
                        hide-bottom-space
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Puesto / Ocupación</td>
                    <td>
                      <q-input
                        outlined
                        dense
                        v-model="form.job_title"
                        hide-bottom-space
                      />
                    </td>
                  </tr>
                  <tr class="bg-grey-2">
                    <td
                      colspan="2"
                      class="text-subtitle2 text-weight-bold"
                    >
                      Configuraciones de Contacto y Estatus
                    </td>
                  </tr>
                  <tr>
                    <td>Restricciones Contacto *</td>
                    <td>
                      <q-input
                        outlined
                        dense
                        v-model="form.contact_restrictions"
                        :error="!!errors.contact_restrictions"
                        :error-message="errors.contact_restrictions"
                        @update:model-value="errors.contact_restrictions = null"
                        hide-bottom-space
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Persona que nos conectó</td>
                    <td>
                      <q-input
                        outlined
                        dense
                        v-model="form.referred_by"
                        hide-bottom-space
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Relación</td>
                    <td>
                      <q-input
                        outlined
                        dense
                        v-model="form.referral_relationship"
                        hide-bottom-space
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Observaciones</td>
                    <td>
                      <q-input
                        outlined
                        dense
                        type="textarea"
                        rows="2"
                        v-model="form.notes"
                        hide-bottom-space
                      />
                    </td>
                  </tr>
                  <tr>
                    <td>Contacto Privado</td>
                    <td>
                      <q-checkbox
                        v-model="form.is_private_contact"
                        :true-value="1"
                        :false-value="0"
                        label="NO SE INCLUIRÁ EN NINGÚN ENVÍO MASIVO"
                        color="red"
                      />
                    </td>
                  </tr>

                  <tr>
                    <td>Prospecto para:</td>
                    <td>
                      <div class="row q-col-gutter-y-sm q-col-gutter-x-md q-py-xs">
                        <div
                          v-for="option in prospectOptions"
                          :key="option"
                          class="col-12 col-sm-4"
                        >
                          <q-checkbox
                            v-model="form.prospect_for"
                            :val="option"
                            :label="option"
                            dense
                            color="primary"
                            class="text-grey-9 text-caption text-weight-medium"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
            </q-tab-panel>

            <q-tab-panel
              name="fiscal"
              class="q-pa-none"
            >
              <div class="row items-center q-pa-md bg-grey-1">
                <div>
                  <div class="text-subtitle2 text-weight-bold text-grey-8">
                    Denominaciones Sociales y Cobranza
                  </div>
                  <div class="text-caption text-grey-6">
                    Cuentas fiscales registradas: {{ form.fiscal_records.length }}
                  </div>
                </div>
                <q-btn
                  class="q-ml-auto q-px-sm"
                  color="secondary"
                  icon="sym_o_add_card"
                  label="Agregar Razón Social / RFC"
                  dense
                  @click="openAddFiscal"
                />
              </div>

              <div class="q-pa-sm">
                <q-markup-table
                  flat
                  bordered
                  v-if="form.fiscal_records.length > 0"
                >
                  <thead>
                    <tr class="bg-grey-2">
                      <th class="text-left">RFC</th>
                      <th class="text-left">RAZÓN SOCIAL</th>
                      <th class="text-left">CONTACTO COBRANZA</th>
                      <th class="text-right">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(rec, index) in form.fiscal_records"
                      :key="index"
                    >
                      <td class="text-weight-bold text-primary">{{ rec.rfc.toUpperCase() }}</td>
                      <td>
                        {{ rec.tax_name }}
                        <span class="text-caption text-grey-6">({{ rec.commercial_name }})</span>
                      </td>
                      <td>{{ rec.billing_contact_name || 'No asignado' }}</td>
                      <td class="text-right q-gutter-x-xs">
                        <q-btn
                          flat
                          round
                          dense
                          icon="sym_o_edit"
                          color="primary"
                          @click="openEditFiscal(index)"
                        />
                        <q-btn
                          flat
                          round
                          dense
                          icon="sym_o_delete"
                          color="negative"
                          @click="removeFiscal(index)"
                        />
                      </td>
                    </tr>
                  </tbody>
                </q-markup-table>
                <div
                  v-else
                  class="q-pa-xl text-center text-grey-5 bg-grey-1 rounded-borders"
                >
                  <q-icon
                    name="sym_o_receipt_long"
                    size="48px"
                    class="q-mb-sm"
                  />
                  <div>No hay razones sociales registradas para este donante todavía.</div>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
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
            icon="sym_o_save"
            label="Guardar Completo"
            :loading="loading"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>

  <DonorFiscalRecordModal
    ref="fiscalRecordModalRef"
    @accept="handleFiscalAccept"
  />
</template>

<style lang="scss">
.system-form-table {
  td:first-child {
    padding-left: 12px;
    width: 180px;
    font-weight: bold;
    color: #374151;
    white-space: normal;
  }
  td {
    padding: 6px 12px;
  }
}
</style>

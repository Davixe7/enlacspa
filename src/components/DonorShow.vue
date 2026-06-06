<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'
import DonorVisitModal from 'components/DonorVisitModal.vue'
import DonorGratitudeModal from 'components/DonorGratitudeModal.vue'
import DonorShipmentModal from 'components/DonorShipmentModal.vue'
import DonorFiscalRecordModal from 'components/DonorFiscalRecordModal.vue'
import { date } from 'quasar'

const route = useRoute()
const donor = ref(null)
const shipmentModal = ref(null)
const fiscalModalRef = ref(null)

const openShipmentModal = (id, rowData = null) => {
  shipmentModal.value.open(id, rowData)
}

// Abrir modal para crear
function openAddFiscal() {
  fiscalModalRef.value.open(null, null)
}

// Abrir modal para editar
function openEditFiscal(fiscal, index) {
  fiscalModalRef.value.open(fiscal, index)
}

// Lógica de comunicación con el Backend
async function handleFiscalAccept({ data, closeModal, setErrors }) {
  try {
    if (data.id) {
      await api.put(`/fiscal-records/${data.id}`, data)
    } else {
      await api.post('/fiscal-records', { ...data, donor_id: donor.value.id })
    }
    await loadDonorData() // Refresca todo el donante desde el servidor
    notify.positive('Registro actualizado con éxito')

    closeModal() // <--- Solo se cierra si el backend dio un 200/201 OK
  } catch (e) {
    // Si el backend responde con errores de validación (HTTP 422)
    if (e.response && e.response.status === 422) {
      notify.negative(e.response.data.message || 'Verifica los campos requeridos')
      if (e.response.data.errors) {
        setErrors(e.response.data.errors) // <--- Le pasa los errores específicos a la modal
      }
    } else {
      notify.negative('Error al guardar: ' + (e.message || e))
    }
  }
}

async function deleteFiscal(id) {
  try {
    const confirmed = confirm(
      '¿Estás seguro de eliminar este registro fiscal? Esta acción no se puede deshacer.'
    )

    if (!confirmed) return

    await api.delete(`/fiscal-records/${id}`)

    // Refrescamos los datos para quitar el registro de la vista
    await loadDonorData()

    notify.positive('Registro eliminado con éxito')
  } catch (e) {
    console.error(e)
    notify.negative('Error al eliminar el registro: ' + (e.response?.data?.message || e.message))
  }
}

const visitModalRef = ref(null)
const gratitudeModalRef = ref(null)

async function loadDonorData() {
  const { data } = await api.get(`/donors/${route.params.id}`)
  donor.value = data
}

// Formateador de fechas legible para bitácoras e historiales (con hora)
// En tu DonorShow.vue
function formatDate(isoString) {
  if (!isoString) return 'N/A'

  // Si el string contiene una 'T', tomamos solo la fecha para evitar el ajuste horario
  const dateOnly = isoString.split('T')[0]
  const [year, month, day] = dateOnly.split('-')

  // Creamos el objeto Date con los componentes exactos
  const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))

  return date.formatDate(d, 'DD/MM/YYYY')
}

// Helper para formatear fechas de nacimiento puras evitando desfasamiento de zona horaria (UTC)
function formatLocalDate(dateString) {
  if (!dateString) return 'N/A'

  // Extrae la parte YYYY-MM-DD e ignora zonas horarias implícitas
  const cleanDate = dateString.split('T')[0]
  const [year, month, day] = cleanDate.split('-')

  // Crea el objeto Date con la hora del entorno local sin desfase (el mes en JS es base 0)
  const localDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))

  return date.formatDate(localDate, 'DD/MM/YYYY')
}

// Funciones para abrir modales
const openVisit = (donorId, rowData = null) => {
  visitModalRef.value.open(donorId, rowData)
}

const openGratitude = (donorId, rowData = null) => {
  gratitudeModalRef.value.open(donorId, rowData)
}

async function deleteVisit(id) {
  try {
    const confirmed = confirm(
      '¿Estás seguro de eliminar esta visita? Esta acción no se puede deshacer.'
    )
    if (!confirmed) return

    await api.delete(`/donor-visits/${id}`)

    // Refrescamos los datos del donante para que la tabla se actualice sola
    await loadDonorData()

    notify.positive('Visita eliminada con éxito')
  } catch (e) {
    console.error(e)
    notify.negative('Error al eliminar la visita: ' + (e.response?.data?.message || e.message))
  }
}

onMounted(loadDonorData)
</script>

<template>
  <q-page
    v-if="donor"
    class="q-pa-lg"
  >
    <div class="row items-center q-mb-xl">
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        color="grey-8"
        class="q-mr-md"
        @click="$router.push('/donors')"
      />
      <div class="text-h4 text-weight-bold text-dark">
        {{ donor.first_name }} {{ donor.last_name }}
      </div>
    </div>

    <!-- Ficha de Datos Personales -->
    <q-card
      flat
      bordered
      class="q-mb-xl"
    >
      <!-- Cabecera Compacta: Identificadores y Estatus Real -->
      <q-card-section class="q-py-sm bg-grey-1 row items-center justify-between">
        <div class="row items-center q-gutter-x-sm">
          <q-icon
            :name="donor.donor_type === 'Moral' ? 'corporate_fare' : 'person'"
            color="primary"
            size="xs"
          />
          <div class="text-caption text-grey-7">
            Kardex ID: <span class="text-weight-bold text-grey-9">#{{ donor.id }}</span>
            <span class="q-mx-xs">|</span>
            Tipo:
            <span class="text-weight-medium text-grey-9">{{ donor.donor_type || 'Físico' }}</span>
          </div>
        </div>
        <q-badge
          :color="donor.is_active ? 'positive' : 'negative'"
          class="q-px-sm text-weight-bold"
        >
          {{ donor.is_active ? 'ACTIVO' : 'INACTIVO' }}
        </q-badge>
      </q-card-section>

      <q-card-section class="q-pa-lg">
        <div class="row q-col-gutter-xl">
          <!-- Columna 1: Perfil e Identidad -->
          <div
            class="col-12 col-md-4"
            style="border-right: 1px dashed #e0e0e0"
          >
            <div class="text-subtitle2 text-primary text-weight-bold q-mb-md">
              Identidad y Perfil
            </div>
            <q-list
              dense
              class="q-gutter-y-xs"
            >
              <template v-if="donor.donor_type !== 'Moral'">
                <q-item class="row"
                  ><q-item-section
                    side
                    class="text-weight-bold text-grey-7 no-wrap"
                    style="min-width: 140px"
                    >Nombre(s):</q-item-section
                  ><q-item-section>{{ donor.first_name }}</q-item-section></q-item
                >
                <q-item class="row"
                  ><q-item-section
                    side
                    class="text-weight-bold text-grey-7 no-wrap"
                    style="min-width: 140px"
                    >Apellidos:</q-item-section
                  ><q-item-section>{{
                    [donor.last_name, donor.second_last_name].filter(Boolean).join(' ') || 'N/A'
                  }}</q-item-section></q-item
                >
                <q-item class="row"
                  ><q-item-section
                    side
                    class="text-weight-bold text-grey-7 no-wrap"
                    style="min-width: 140px"
                    >Prefiere Llamada:</q-item-section
                  ><q-item-section class="text-italic text-secondary">{{
                    donor.preferred_name || 'No especificado'
                  }}</q-item-section></q-item
                >
                <q-item class="row"
                  ><q-item-section
                    side
                    class="text-weight-bold text-grey-7 no-wrap"
                    style="min-width: 140px"
                    >Sexo / Género:</q-item-section
                  ><q-item-section>{{ donor.gender || 'N/A' }}</q-item-section></q-item
                >
                <q-item class="row"
                  ><q-item-section
                    side
                    class="text-weight-bold text-grey-7 no-wrap"
                    style="min-width: 140px"
                    >Nacimiento:</q-item-section
                  ><q-item-section>{{ formatLocalDate(donor.birth_date) }}</q-item-section></q-item
                >
                <q-item class="row"
                  ><q-item-section
                    side
                    class="text-weight-bold text-grey-7 no-wrap"
                    style="min-width: 140px"
                    >Estado Civil:</q-item-section
                  ><q-item-section>{{ donor.marital_status || 'N/A' }}</q-item-section></q-item
                >
              </template>
              <template v-else>
                <q-item class="row"
                  ><q-item-section
                    side
                    class="text-weight-bold text-grey-7 no-wrap"
                    style="min-width: 140px"
                    >Razon Social:</q-item-section
                  ><q-item-section class="text-weight-medium">{{
                    donor.company_name
                  }}</q-item-section></q-item
                >
                <q-item class="row"
                  ><q-item-section
                    side
                    class="text-weight-bold text-grey-7 no-wrap"
                    style="min-width: 140px"
                    >Representante:</q-item-section
                  ><q-item-section>{{ donor.full_name || 'No asignado' }}</q-item-section></q-item
                >
                <q-item class="row"
                  ><q-item-section
                    side
                    class="text-weight-bold text-grey-7 no-wrap"
                    style="min-width: 140px"
                    >Puesto:</q-item-section
                  ><q-item-section>{{ donor.job_title || 'N/A' }}</q-item-section></q-item
                >
              </template>
            </q-list>
          </div>

          <!-- Columna 2: Contacto y Localización Física Completa -->
          <div
            class="col-12 col-md-4"
            style="border-right: 1px dashed #e0e0e0"
          >
            <div class="text-subtitle2 text-primary text-weight-bold q-mb-md">
              Contacto y Ubicación
            </div>
            <q-list
              dense
              class="q-gutter-y-xs"
            >
              <q-item class="row"
                ><q-item-section
                  side
                  class="text-weight-bold text-grey-7 no-wrap"
                  style="min-width: 100px"
                  >Celular:</q-item-section
                ><q-item-section class="text-weight-medium">{{
                  donor.cellphone || 'N/A'
                }}</q-item-section></q-item
              >
              <q-item class="row"
                ><q-item-section
                  side
                  class="text-weight-bold text-grey-7 no-wrap"
                  style="min-width: 100px"
                  >Tel. Fijo:</q-item-section
                ><q-item-section>{{ donor.landline || 'N/A' }}</q-item-section></q-item
              >
              <q-item class="row"
                ><q-item-section
                  side
                  class="text-weight-bold text-grey-7 no-wrap"
                  style="min-width: 100px"
                  >Correo:</q-item-section
                ><q-item-section class="text-ellipsis text-primary">{{
                  donor.personal_email || 'N/A'
                }}</q-item-section></q-item
              >
              <q-item class="row">
                <q-item-section
                  side
                  class="text-weight-bold text-grey-7 no-wrap"
                  style="min-width: 100px"
                  >Sector:</q-item-section
                >
                <q-item-section class="text-grey-9 text-weight-medium">{{
                  donor.sector || 'N/A'
                }}</q-item-section>
              </q-item>
              <q-item class="row items-start">
                <q-item-section
                  side
                  class="text-weight-bold text-grey-7 no-wrap"
                  style="min-width: 100px"
                  >Domicilio:</q-item-section
                >
                <q-item-section class="text-caption text-grey-9">
                  <div v-if="donor.street || donor.exterior_number || donor.neighborhood">
                    {{ donor.street }} {{ donor.exterior_number }}
                    <div v-if="donor.neighborhood">Col. {{ donor.neighborhood }}</div>
                    <div>
                      {{ [donor.city, donor.state].filter(Boolean).join(', ') }}
                      {{ donor.postal_code ? `C.P. ${donor.postal_code}` : '' }}
                    </div>
                    <div class="text-grey-5 text-weight-bold">{{ donor.country }}</div>
                  </div>
                  <div
                    v-else
                    class="text-italic text-grey-5"
                  >
                    Sin domicilio particular registrado
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Columna 3: Vínculos, Ámbito Laboral y Restricciones -->
          <div class="col-12 col-md-4">
            <div class="text-subtitle2 text-primary text-weight-bold q-mb-md">
              Vínculos y Restricciones
            </div>
            <q-list
              dense
              class="q-gutter-y-xs"
            >
              <template v-if="donor.donor_type !== 'Moral'">
                <q-item class="row"
                  ><q-item-section
                    side
                    class="text-weight-bold text-grey-7 no-wrap"
                    style="min-width: 155px"
                    >Empresa:</q-item-section
                  ><q-item-section class="text-grey-9 text-weight-medium">{{
                    donor.company_name || 'N/A'
                  }}</q-item-section></q-item
                >
                <q-item class="row"
                  ><q-item-section
                    side
                    class="text-weight-bold text-grey-7 no-wrap"
                    style="min-width: 155px"
                    >Puesto:</q-item-section
                  ><q-item-section class="text-grey-9 text-weight-medium">{{
                    donor.job_title || 'N/A'
                  }}</q-item-section></q-item
                >
              </template>

              <!-- Datos de conexión / Referencia -->
              <q-item class="row items-start">
                <q-item-section
                  side
                  class="text-weight-bold text-grey-7 no-wrap"
                  style="min-width: 155px"
                  >Conectado por:</q-item-section
                >
                <q-item-section class="text-grey-9 text-weight-medium">
                  <div v-if="donor.referred_by">
                    {{ donor.referred_by }}
                    <span
                      v-if="donor.referral_relationship"
                      class="text-grey-6 text-caption"
                    >
                      ({{ donor.referral_relationship }})</span
                    >
                  </div>
                  <div
                    v-else
                    class="text-grey-5 text-italic text-caption"
                  >
                    Directo / Ninguno
                  </div>
                </q-item-section>
              </q-item>

              <!-- ¿Conoce ENLAC? -->
              <q-item class="row">
                <q-item-section
                  side
                  class="text-weight-bold text-grey-7 no-wrap"
                  style="min-width: 155px"
                  >¿Conoce ENLAC?:</q-item-section
                >
                <q-item-section class="text-grey-9 text-weight-medium">
                  {{ donor.knows_facilities ? 'SÍ' : 'No' }}
                </q-item-section>
              </q-item>

              <!-- Bloque de Cónyuge -->
              <q-item
                v-if="donor.donor_type !== 'Moral'"
                class="row items-start"
              >
                <q-item-section
                  side
                  class="text-weight-bold text-grey-7 no-wrap"
                  style="min-width: 155px"
                  >Cónyuge:</q-item-section
                >
                <q-item-section class="text-grey-9 text-weight-medium">
                  <div>
                    {{
                      [
                        donor.spouse_first_name,
                        donor.spouse_last_name,
                        donor.spouse_second_last_name
                      ]
                        .filter(Boolean)
                        .join(' ') || 'N/A'
                    }}
                  </div>
                  <div
                    v-if="donor.spouse_birth_date || donor.wedding_anniversary"
                    class="text-grey-6 text-caption q-mt-xs text-weight-normal"
                  >
                    <span v-if="donor.spouse_birth_date">
                      🎂 {{ formatLocalDate(donor.spouse_birth_date) }}
                    </span>
                    <span
                      v-if="donor.wedding_anniversary"
                      class="q-ml-xs"
                      >💍 {{ donor.wedding_anniversary }}</span
                    >
                  </div>
                </q-item-section>
              </q-item>

              <!-- Privacidad y Restricciones críticas -->
              <q-item class="row">
                <q-item-section
                  side
                  class="text-weight-bold text-grey-7 no-wrap"
                  style="min-width: 155px"
                  >Contacto Privado:</q-item-section
                >
                <q-item-section class="text-grey-9 text-weight-medium">
                  {{ donor.is_private_contact ? 'SÍ (EXCLUIR MASIVOS)' : 'NO' }}
                </q-item-section>
              </q-item>

              <q-item class="row items-start">
                <q-item-section
                  side
                  class="text-weight-bold text-negative no-wrap"
                  style="min-width: 155px"
                  >Restricciones:</q-item-section
                >
                <q-item-section class="text-negative text-weight-medium">
                  {{ donor.contact_restrictions || 'Sin restricciones de contacto' }}
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>

        <!-- Bloque Expandible para Campañas de Prospección y Notas Internas -->
        <div class="q-mt-lg bg-grey-2 rounded-borders">
          <q-expansion-item
            icon="assignment"
            label="Ver Campañas de Prospección y Notas Internas"
            header-class="text-weight-medium text-grey-8"
            dense
          >
            <q-card class="bg-white q-pa-md">
              <div class="row q-col-gutter-md">
                <!-- Izquierda: Prospección -->
                <div class="col-12 col-sm-6">
                  <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">
                    Prospecto para:
                  </div>
                  <div
                    v-if="donor.prospect_for && donor.prospect_for.length > 0"
                    class="row q-gutter-xs"
                  >
                    <q-badge
                      v-for="campaign in donor.prospect_for"
                      :key="campaign"
                      color="indigo-1"
                      text-color="indigo-9"
                      class="text-weight-bold"
                    >
                      {{ campaign }}
                    </q-badge>
                  </div>
                  <div
                    v-else
                    class="text-caption text-italic text-grey-5"
                  >
                    No asignado como prospecto activo.
                  </div>
                </div>
                <!-- Derecha: Observaciones -->
                <div class="col-12 col-sm-6">
                  <div class="text-caption text-weight-bold text-grey-7 q-mb-xs">
                    Observaciones generales:
                  </div>
                  <p
                    class="text-caption text-grey-9 bg-grey-1 q-pa-sm rounded-borders q-mb-none"
                    style="white-space: pre-wrap"
                  >
                    {{ donor.notes || 'Sin anotaciones adicionales.' }}
                  </p>
                </div>
              </div>
            </q-card>
          </q-expansion-item>
        </div>

        <!-- Barra de Trazabilidad Integrada -->
        <q-separator class="q-mt-md q-mb-xs" />
        <div class="row q-gutter-x-md text-caption text-grey-6 justify-end q-pt-xs">
          <div>
            <q-icon
              name="event"
              size="14px"
              class="q-mr-xs"
            /><strong>Creado:</strong>
            {{ donor.created_at ? donor.created_at.split('T')[0] : 'N/A' }}
          </div>
          <div>
            <q-icon
              name="edit_calendar"
              size="14px"
              class="q-mr-xs"
            /><strong>Actualizado:</strong>
            {{ donor.updated_at ? donor.updated_at.split('T')[0] : 'N/A' }}
          </div>
          <div>
            <q-icon
              name="published_with_changes"
              size="14px"
              class="q-mr-xs"
            /><strong>Estatus:</strong>
            {{ donor.status_changed_at ? donor.status_changed_at.split('T')[0] : 'N/A' }}
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Razones Sociales -->
    <q-card
      flat
      bordered
      class="q-mb-xl"
    >
      <q-card-section class="row items-center bg-grey-2 q-py-md">
        <div class="text-h6 text-grey-9 text-weight-medium">Razones / Denominaciones Sociales</div>
        <q-space />
        <q-btn
          color="primary"
          label="(+) Nueva"
          unelevated
          @click="openAddFiscal"
        />
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-markup-table
          flat
          v-if="donor.fiscal_records && donor.fiscal_records.length > 0"
        >
          <thead>
            <tr class="bg-grey-1 text-grey-7">
              <th class="text-left">RFC</th>
              <th class="text-left">Razón Social</th>
              <th class="text-left">Contacto Cobranza</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(fiscal, index) in donor.fiscal_records"
              :key="fiscal.id"
            >
              <td class="text-weight-bold">{{ fiscal.rfc }}</td>
              <td>{{ fiscal.tax_name }}</td>
              <td>{{ fiscal.billing_contact_name }}</td>
              <td class="text-right">
                <q-btn
                  flat
                  round
                  dense
                  icon="sym_o_edit"
                  color="primary"
                  class="q-mr-xs"
                  @click="openEditFiscal(fiscal, index)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="sym_o_delete"
                  color="negative"
                  @click="deleteFiscal(fiscal.id)"
                />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>

    <!-- Bitácora de Visitas -->
    <q-card
      flat
      bordered
      class="q-mb-xl"
    >
      <q-card-section class="row items-center q-py-md bg-grey-1">
        <div class="text-h6 text-grey-9 text-weight-medium">Bitácora de Visitas</div>
        <q-space />
        <q-btn
          color="primary"
          label="(+) Nueva Visita"
          unelevated
          @click="openVisit(donor.id)"
        />
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-markup-table flat>
          <thead>
            <tr class="bg-grey-1 text-grey-7">
              <th class="text-left">Fecha</th>
              <th class="text-left">Contacto ENLAC</th>
              <th class="text-left">Motivo</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="visit in donor.visits"
              :key="visit.id"
            >
              <td>{{ formatDate(visit.visit_date) }}</td>
              <td>{{ visit.responsible?.name }} {{ visit.responsible?.last_name }}</td>
              <td>{{ visit.reason }}</td>
              <td class="text-right">
                <q-btn
                  flat
                  round
                  dense
                  icon="sym_o_edit"
                  color="secondary"
                  class="q-mr-xs"
                  @click="openVisit(donor.id, visit)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="sym_o_delete"
                  color="negative"
                  @click="deleteVisit(visit.id)"
                />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>

    <!-- Agradecimientos -->
    <q-card
      flat
      bordered
      class="q-mb-xl"
    >
      <q-card-section class="row items-center q-py-md bg-grey-1">
        <div class="text-h6 text-grey-9 text-weight-medium">Agradecimientos</div>
        <q-space />
        <q-btn
          color="primary"
          label="(+) Nuevo Agradecimiento"
          unelevated
          @click="openGratitude(donor.id)"
        />
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-markup-table flat>
          <thead>
            <tr class="bg-grey-1 text-grey-7">
              <th class="text-left">Fecha</th>
              <th class="text-left">Campaña / Programa</th>
              <th class="text-left">Tipo de Agradecimiento</th>
              <th class="text-left">Método de Envio</th>
              <th class="text-left">Persona a quien se Entrega</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="gratitude in donor.gratitudes"
              :key="gratitude.id"
            >
              <td>{{ formatDate(gratitude.date) }}</td>
              <td>{{ gratitude.campaign_program }}</td>
              <td>{{ gratitude.type }}</td>
              <td>{{ gratitude.delivery_method }}</td>
              <td>{{ gratitude.recipient_name }}</td>
              <td class="text-right">
                <q-btn
                  flat
                  round
                  dense
                  icon="sym_o_edit"
                  color="secondary"
                  @click="openGratitude(donor.id, gratitude)"
                />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>

    <!-- Envío de material -->
    <q-card
      flat
      bordered
      class="q-mb-md"
    >
      <q-card-section class="row items-center q-py-md bg-grey-1">
        <div class="text-h6 text-grey-9 text-weight-medium">
          Bitácora de Envío de Tarjetas, Videos y Otros
        </div>
        <q-space />
        <q-btn
          color="primary"
          label="(+) Nuevo Envío"
          unelevated
          @click="openShipmentModal(donor.id)"
        />
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-markup-table flat>
          <thead>
            <tr class="bg-grey-1 text-grey-7">
              <th class="text-left">Fecha</th>
              <th class="text-left">Descripción del Material</th>
              <th class="text-left">Método de Envío</th>
              <th class="text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="shipment in donor.shipments"
              :key="shipment.id"
            >
              <td>{{ formatDate(shipment.date) }}</td>
              <td>{{ shipment.material_description }}</td>
              <td>{{ shipment.delivery_method }}</td>
              <td class="text-right">
                <q-btn
                  flat
                  round
                  dense
                  icon="sym_o_edit"
                  color="secondary"
                  @click="openShipmentModal(donor.id, shipment)"
                />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>

    <!-- Historial de Donativos -->
    <q-card
      flat
      bordered
      class="q-mb-xl"
    >
      <q-card-section class="row items-center q-py-md bg-grey-1">
        <div class="text-h6 text-grey-9 text-weight-medium">Historial de Donativos</div>
        <q-space />
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-markup-table flat>
          <thead>
            <tr class="bg-grey-1 text-grey-7">
              <th class="text-left">No. Folio</th>
              <th class="text-left">Fecha de Pago</th>
              <th class="text-left">Tipo de Actividad</th>
              <th class="text-left">Concepto / Actividad</th>
              <th class="text-left">Forma de Pago</th>
              <th class="text-left">Recibo Deducible</th>
              <th class="text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="donative in donor.donations"
              :key="donative.id"
            >
              <td class="text-weight-medium text-primary">
                {{ donative.folio_number }}
              </td>
              <td>{{ formatDate(donative.payment_date) }}</td>
              <td>
                <q-badge
                  color="blue-grey-6"
                  outline
                >
                  {{ donative.activity_type }}
                </q-badge>
              </td>
              <td
                style="max-width: 250px"
                class="ellipsis"
              >
                {{ donative.concept || 'N/A' }}
              </td>
              <td>{{ donative.payment_method }}</td>
              <td>
                <q-badge :color="donative.has_tax_receipt ? 'positive' : 'grey-5'">
                  {{
                    donative.has_tax_receipt
                      ? donative.tax_receipt_number || 'Sí (Sin Folio)'
                      : 'No'
                  }}
                </q-badge>
              </td>
              <td class="text-right text-weight-bold">
                $ {{ donative.amount }} <small class="text-grey-6">{{ donative.currency }}</small>
              </td>
            </tr>

            <tr v-if="!donor.donations || donor.donations.length === 0">
              <td
                colspan="7"
                class="text-center text-grey-6 q-py-md"
              >
                No se han registrado donativos para este donante.
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>

    <!-- Historial de Cambios de Estatus -->
    <q-card
      flat
      bordered
      class="q-mb-xl"
    >
      <q-card-section class="row items-center q-py-md bg-grey-1">
        <div class="text-h6 text-grey-9 text-weight-medium">Historial de Cambios de Estatus</div>
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-markup-table flat>
          <thead>
            <tr class="bg-grey-1 text-grey-7">
              <th class="text-left">Estatus Cambiado a</th>
              <th class="text-left">Fecha y Hora</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="log in donor.status_logs"
              :key="log.id"
            >
              <td>
                <q-badge :color="log.is_active ? 'positive' : 'negative'">
                  {{ log.is_active ? 'ACTIVO' : 'INACTIVO' }}
                </q-badge>
              </td>
              <td>{{ formatDate(log.changed_at) }}</td>
            </tr>
            <tr v-if="!donor.status_logs || donor.status_logs.length === 0">
              <td
                colspan="2"
                class="text-center text-grey-6 q-py-md"
              >
                No hay historial de cambios registrado.
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>

    <DonorVisitModal
      ref="visitModalRef"
      @saved="loadDonorData"
    />
    <DonorGratitudeModal
      ref="gratitudeModalRef"
      @saved="loadDonorData"
    />
    <donor-shipment-modal
      ref="shipmentModal"
      @saved="loadDonorData"
    />
    <DonorFiscalRecordModal
      ref="fiscalModalRef"
      @accept="handleFiscalAccept"
    />
  </q-page>
</template>

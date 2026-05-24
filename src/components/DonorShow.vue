<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'
import DonorVisitModal from 'components/DonorVisitModal.vue'
import DonorGratitudeModal from 'components/DonorGratitudeModal.vue'
import DonorShipmentModal from 'components/DonorShipmentModal.vue'
import DonorFiscalRecordModal from 'components/DonorFiscalRecordModal.vue'

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
async function handleFiscalAccept({ data }) {
  try {
    if (data.id) {
      await api.put(`/fiscal-records/${data.id}`, data)
    } else {
      await api.post('/fiscal-records', { ...data, donor_id: donor.value.id })
    }
    await loadDonorData() // Refresca todo el donante desde el servidor
    notify.positive('Registro actualizado')
  } catch (e) {
    notify.negative('Error al guardar ' + e)
  }
}

const visitModalRef = ref(null)
const gratitudeModalRef = ref(null)

async function loadDonorData() {
  const { data } = await api.get(`/donors/${route.params.id}`)
  donor.value = data
}

// Formateador de fechas legible
function formatDate(isoString) {
  if (!isoString) return 'N/A'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return isoString

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year} a las ${hours}:${minutes} hrs`
}

// Funciones para abrir modales
const openVisit = (donorId, rowData = null) => {
  visitModalRef.value.open(donorId, rowData)
}

const openGratitude = (donorId, rowData = null) => {
  gratitudeModalRef.value.open(donorId, rowData)
}

onMounted(loadDonorData)
</script>

<template>
  <q-page
    v-if="donor"
    class="q-pa-lg"
  >
    <!-- Header -->
    <div class="text-h4 q-mb-xl text-weight-bold text-dark">
      {{ donor.first_name }} {{ donor.last_name }}
    </div>

    <!-- Ficha de Datos Personales -->
    <q-card
      flat
      bordered
      class="q-mb-xl"
    >
      <q-card-section class="q-py-md bg-grey-1">
        <div class="text-subtitle1 text-weight-bold text-grey-9">Ficha Completa de Donante</div>
      </q-card-section>

      <q-card-section class="q-pa-lg">
        <div class="row q-col-gutter-xl">
          <!-- Sección Identidad -->
          <div class="col-12 col-md-4">
            <div class="text-subtitle2 text-primary text-weight-bold q-mb-md">Identidad</div>
            <q-list
              dense
              separator
            >
              <q-item>
                <q-item-section side>ID:</q-item-section>
                <q-item-section class="text-weight-bold">{{ donor.id }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side>Nombre:</q-item-section>
                <q-item-section class="text-weight-bold">{{ donor.full_name }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side>Preferido:</q-item-section>
                <q-item-section>{{ donor.preferred_name || 'N/A' }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side>Estado Civil:</q-item-section>
                <q-item-section>{{ donor.marital_status || 'N/A' }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side>Género:</q-item-section>
                <q-item-section>{{ donor.gender || 'N/A' }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side>Nacimiento:</q-item-section>
                <q-item-section>{{ donor.birth_date || 'N/A' }}</q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Sección Contacto y Ubicación -->
          <div class="col-12 col-md-4">
            <div class="text-subtitle2 text-primary text-weight-bold q-mb-md">
              Contacto y Domicilio
            </div>
            <q-list
              dense
              separator
            >
              <q-item>
                <q-item-section side>Celular:</q-item-section>
                <q-item-section>{{ donor.cellphone || 'N/A' }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side>Fijo:</q-item-section>
                <q-item-section>{{ donor.landline || 'N/A' }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side>Email:</q-item-section>
                <q-item-section>{{ donor.personal_email || 'N/A' }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side>Sector:</q-item-section>
                <q-item-section>{{ donor.sector || 'N/A' }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side>Domicilio:</q-item-section>
                <q-item-section>
                  {{
                    [
                      donor.street,
                      donor.exterior_number,
                      donor.neighborhood,
                      donor.city,
                      donor.state,
                      donor.country
                    ]
                      .filter(Boolean)
                      .join(', ') || 'N/A'
                  }}
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section side>CP:</q-item-section>
                <q-item-section>{{ donor.postal_code || 'N/A' }}</q-item-section>
              </q-item>
            </q-list>
          </div>

          <!-- Sección Profesional y Estatus -->
          <div class="col-12 col-md-4">
            <div class="text-subtitle2 text-primary text-weight-bold q-mb-md">
              Profesional y Estatus
            </div>
            <q-list
              dense
              separator
            >
              <q-item>
                <q-item-section side>Empresa:</q-item-section>
                <q-item-section>{{ donor.company_name || 'N/A' }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side>Puesto:</q-item-section>
                <q-item-section>{{ donor.job_title || 'N/A' }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side>Referido por:</q-item-section>
                <q-item-section>
                  {{ donor.referred_by || 'N/A' }}
                  <span
                    v-if="donor.referral_relationship"
                    class="text-caption text-grey-7"
                  >
                    ({{ donor.referral_relationship }})
                  </span>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section side>Prospecto para:</q-item-section>
                <q-item-section>{{ donor.prospect_for || 'N/A' }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side>Estatus:</q-item-section>
                <q-item-section>
                  <q-badge
                    :color="donor.is_active ? 'positive' : 'negative'"
                    class="q-px-sm"
                  >
                    {{ donor.is_active ? 'Activo' : 'Inactivo' }}
                  </q-badge>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section side>Privado:</q-item-section>
                <q-item-section>{{ donor.is_private_contact ? 'SÍ' : 'No' }}</q-item-section>
              </q-item>
              <q-item>
                <q-item-section side>Instalaciones:</q-item-section>
                <q-item-section>{{
                  donor.knows_facilities ? 'Las conoce' : 'No las conoce'
                }}</q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>

        <!-- Sección Cónyuge -->
        <div class="row q-mt-lg">
          <div class="col-12">
            <div class="text-subtitle2 text-primary text-weight-bold q-mb-sm">
              Datos del Cónyuge y Familia
            </div>
            <div class="row bg-grey-1 q-pa-md rounded-borders q-col-gutter-md">
              <div class="col-12 col-md-4">
                <strong>Nombre:</strong>
                {{
                  [donor.spouse_first_name, donor.spouse_last_name, donor.spouse_second_last_name]
                    .filter(Boolean)
                    .join(' ') || 'N/A'
                }}
              </div>
              <div class="col-12 col-md-4">
                <strong>Nacimiento Cónyuge:</strong> {{ donor.spouse_birth_date || 'N/A' }}
              </div>
              <div class="col-12 col-md-4">
                <strong>Aniversario de Bodas:</strong> {{ donor.wedding_anniversary || 'N/A' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Notas y Restricciones -->
        <div class="row q-mt-lg">
          <div class="col-12">
            <div class="text-body2 text-dark q-mb-sm">
              <strong>Restricciones de Contacto:</strong>
              {{ donor.contact_restrictions || 'Sin restricciones' }}
            </div>
            <div class="text-body2 text-dark q-mb-xl">
              <strong>Notas:</strong> {{ donor.notes || 'Sin notas registradas' }}
            </div>

            <!-- Barra de Trazabilidad -->
            <q-separator class="q-mb-md" />
            <div class="row q-gutter-sm items-center q-pt-sm">
              <span class="text-subtitle2 text-weight-bold text-secondary q-mr-sm"
                >Trazabilidad:</span
              >

              <q-chip
                outline
                color="blue-7"
                text-color="blue-7"
                icon="event"
                class="q-px-md"
              >
                <span class="text-weight-bold q-mr-xs">Creado:</span>
                {{ formatDate(donor.created_at) }}
              </q-chip>

              <q-chip
                outline
                color="orange-8"
                text-color="orange-8"
                icon="edit_calendar"
                class="q-px-md"
              >
                <span class="text-weight-bold q-mr-xs">Última actualización:</span>
                {{ formatDate(donor.updated_at) }}
              </q-chip>

              <q-chip
                outline
                color="teal-8"
                text-color="teal-8"
                icon="published_with_changes"
                class="q-px-md"
              >
                <span class="text-weight-bold q-mr-xs">Cambio de estatus:</span>
                {{ formatDate(donor.status_changed_at) }}
              </q-chip>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Sección Fiscal Independiente en DonorShow -->
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
              <td>{{ visit.visit_date }}</td>
              <td>{{ visit.responsible?.name }} {{ visit.responsible?.last_name }}</td>
              <td>{{ visit.reason }}</td>
              <td class="text-right">
                <q-btn
                  flat
                  round
                  dense
                  icon="sym_o_edit"
                  color="secondary"
                  @click="openVisit(donor.id, visit)"
                />
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
    </q-card>

    <!-- Bitácora de Gratitudes -->
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
              <td>{{ gratitude.date }}</td>
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

    <!-- Bitácora de Envío de Tarjetas, Videos y Otros -->
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
              <td>{{ shipment.date }}</td>
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
        <!-- Descomenta este botón si manejas modal para agregar donativos -->
        <!-- <q-btn color="primary" label="(+) Registrar Donativo" unelevated @click="openDonativeModal(donor.id)" /> -->
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
              <!-- No. Folio -->
              <td class="text-weight-medium text-primary">
                {{ donative.folio_number }}
              </td>

              <!-- Fecha de Pago -->
              <td>{{ formatDate(donative.payment_date) }}</td>

              <!-- Tipo de Actividad -->
              <td>
                <q-badge
                  color="blue-grey-6"
                  outline
                >
                  {{ donative.activity_type }}
                </q-badge>
              </td>

              <!-- Concepto / Nombre Actividad -->
              <td
                style="max-width: 250px"
                class="ellipsis"
              >
                {{ donative.concept || 'N/A' }}
              </td>

              <!-- Forma de Pago -->
              <td>{{ donative.payment_method }}</td>

              <!-- No. Recibo Deducible -->
              <td>
                <q-badge :color="donative.has_tax_receipt ? 'positive' : 'grey-5'">
                  {{
                    donative.has_tax_receipt
                      ? donative.tax_receipt_number || 'Sí (Sin Folio)'
                      : 'No'
                  }}
                </q-badge>
              </td>

              <!-- Monto -->
              <td class="text-right text-weight-bold">
                $ {{ donative.amount }} <small class="text-grey-6">{{ donative.currency }}</small>
              </td>
            </tr>

            <!-- State por si no hay registros -->
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

    <!-- Modales -->
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
s

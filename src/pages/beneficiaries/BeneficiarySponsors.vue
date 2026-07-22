<script setup>
import { onMounted, ref, computed } from 'vue'
import { api } from 'src/boot/axios'
import SponsorPicker from 'pages/beneficiaries/SponsorPicker.vue'
import { useQuasar } from 'quasar'
import notify from 'src/utils/notify'

const $q = useQuasar()
const dialog = ref(false)
const historyDialog = ref(false)
const historyConfigs = ref([])
const paymentConfigs = ref([])
const hasHistory = ref(false)

const props = defineProps({
  candidateId: { type: String, required: false },
  readonly: { type: Boolean, default: false }
})

onMounted(() => {
  fetchSponsorships()
  checkHistory()
})

const except = computed(() => paymentConfigs.value.map((item) => item.sponsor.id))

// Cargar lista activa
async function fetchSponsorships() {
  try {
    let response = (await api.get(`sponsorships/?candidate_id=${props.candidateId}`)).data.data
    paymentConfigs.value = response.filter((paymentConfig) => !!paymentConfig.sponsor_id)
  } catch (e) {
    notify.negative('Error al cargar los patrocinios')
    console.error('Error cargando patrocinios:', e)
  }
}

// Cargar historial de cancelados
async function loadHistory() {
  try {
    const { data } = await api.get(
      `/sponsorships/list/all-history?candidate_id=${props.candidateId}`
    )
    historyConfigs.value = data.data
    historyDialog.value = true
  } catch (e) {
    console.log(e)
    $q.notify({ type: 'negative', message: 'No se pudo cargar el historial' })
  }
}

function handleClose() {
  dialog.value = false
  fetchSponsorships()
}

async function restoreSponsor(id) {
  try {
    await api.patch(`/sponsorships/${id}/restore`)
    $q.notify({ type: 'positive', message: 'Patrocinio restaurado con éxito' })
    loadHistory()
    fetchSponsorships()
    checkHistory()
  } catch (e) {
    console.log(e)
    $q.notify({ type: 'negative', message: 'Error al restaurar' })
  }
}

async function checkHistory() {
  try {
    const { data } = await api.get(`/sponsorships/has-history?candidate_id=${props.candidateId}`)
    hasHistory.value = data.has_history
  } catch (e) {
    console.log(e)
    console.error('Error verificando historial')
  }
}
</script>

<template>
  <SponsorPicker
    :except="except"
    v-model="dialog"
    @close="handleClose"
  />

  <q-card
    bordered
    flat
    style="display: flex; flex-flow: column nowrap; height: 100%"
  >
    <q-card-section>
      <div class="page-subtitle q-my-none">Padrinos</div>
    </q-card-section>

    <q-markup-table flat>
      <tbody v-if="paymentConfigs.length">
        <tr
          v-for="paymentConfig in paymentConfigs"
          :key="paymentConfig.id"
        >
          <td>
            <div class="text-bold">{{ paymentConfig.sponsor.name }}</div>
            <div>${{ paymentConfig.amount }}</div>
          </td>
          <td class="text-right">
            <router-link
              class="text-primary"
              style="font-size: 0.75rem"
              :to="`padrinos/${paymentConfig.sponsor_id}`"
            >
              Editar
            </router-link>
            <div class="text-caption">Actualizado el {{ paymentConfig.updated_at }}</div>
          </td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr>
          <td
            colspan="2"
            class="text-center"
            style="height: 200px"
          >
            No hay padrinos asociados para mostrar.
          </td>
        </tr>
      </tbody>
    </q-markup-table>

    <q-card-section class="flex justify-between items-center q-mt-auto">
      <q-btn
        flat
        dense
        color="grey-8"
        icon="history"
        label="Historial de Aportaciones"
        :disable="!hasHistory"
        @click="loadHistory"
      />

      <div class="flex">
        <q-btn
          :disable="props.readonly"
          outline
          color="primary"
          icon="sym_o_add"
          @click="dialog = true"
          label="Asociar padrino"
        />
        <q-btn
          :disable="props.readonly"
          unelevated
          class="q-ml-md"
          color="primary"
          icon="sym_o_add"
          to="padrinos/crear"
          label="Registrar nuevo"
        />
      </div>
    </q-card-section>
  </q-card>

  <q-dialog v-model="historyDialog">
    <q-card style="min-width: 600px">
      <q-card-section class="row items-center">
        <div class="text-h6">Historial de Patrocinios</div>
      </q-card-section>

      <q-markup-table
        flat
        separator="horizontal"
      >
        <thead>
          <tr>
            <th class="text-left">Padrino</th>
            <th class="text-left">Monto</th>
            <th class="text-left">Estado</th>
            <th class="text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="item in historyConfigs"
            :key="item.id"
          >
            <td>{{ item.sponsor?.name || 'Sin Padrino' }}</td>

            <td>{{ '$' + Number(item.amount).toFixed(2) }}</td>
            <td>
              <q-badge :color="item.is_active ? 'positive' : 'negative'">
                {{ item.is_active ? 'Activo' : 'Cancelado' }}
              </q-badge>
              <div
                v-if="!item.is_active"
                class="text-caption"
              >
                {{ item.deleted_at_formatted }}
                <br /><i
                  >Motivo:
                  {{ item.cancellation_reason ? item.cancellation_reason : 'Sin motivo' }}</i
                >
              </div>
            </td>
            <td class="text-right">
              <q-btn
                v-if="!item.is_active"
                icon="restore"
                label="Restaurar"
                color="positive"
                flat
                dense
                @click="restoreSponsor(item.id)"
              />
            </td>
          </tr>
        </tbody>
      </q-markup-table>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cerrar"
          color="primary"
          v-close-popup
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'
import { ref, onMounted } from 'vue'

const props = defineProps(['procurationActivityId'])
const loading = ref(false)
const configForm = ref({
  id: null,
  procuration_activity_id: props.procurationActivityId,
  tickets_count: 0,
  ticket_price: 0,
  created_date: null,
  event_date: null,
  place: '',
  winning_ticket: null,
  winner_name: '',
  seller_winner_name: ''
})

async function fetchRaffle() {
  if (!props.procurationActivityId) return
  try {
    loading.value = true
    let route = `raffles/?procuration_activity_id=${props.procurationActivityId}`
    let response = (await api.get(route)).data.data
    configForm.value = response.id ? response : configForm.value
  } catch (error) {
    console.log(error)
    notify.negative('Error al cargar los datos de la rifa')
  } finally {
    loading.value = false
  }
}

async function saveRaffle() {
  if (!props.procurationActivityId) return
  try {
    loading.value = true
    let route = `raffles/?procuration_activity_id=${props.procurationActivityId}`
    let response = (await api.post(route, { ...configForm.value })).data.data
    console.log(response)
  } catch (error) {
    console.log(error)
    notify.negative('Error al guardar los datos de la rifa')
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchRaffle())
</script>

<template>
  <q-markup-table>
    <tr>
      <td>Número de Boletos</td>
      <td>
        <q-input
          outlined
          dense
          type="number"
          v-model.number="configForm.tickets_count"
          placeholder="Numérico"
          hide-bottom-space
          :disable="!!configForm.id"
        />
      </td>
    </tr>
    <tr>
      <td>Precio del Boleto</td>
      <td>
        <q-input
          outlined
          dense
          type="number"
          step="0.01"
          prefix="$"
          v-model.number="configForm.ticket_price"
          placeholder="Monetario"
          hide-bottom-space
        />
      </td>
    </tr>
    <tr>
      <td>Fecha de Creación</td>
      <td>
        <q-input
          outlined
          dense
          type="date"
          v-model="configForm.created_date"
          hide-bottom-space
        />
      </td>
    </tr>
    <tr>
      <td>Fecha del Evento</td>
      <td>
        <q-input
          outlined
          dense
          type="date"
          v-model="configForm.event_date"
          hide-bottom-space
        />
      </td>
    </tr>
    <tr>
      <td>Lugar</td>
      <td>
        <q-input
          outlined
          dense
          v-model="configForm.place"
          placeholder="Campo de texto"
          hide-bottom-space
        />
      </td>
    </tr>
    <tr>
      <td>Boleto Ganador</td>
      <td>
        <q-input
          outlined
          dense
          v-model="configForm.winning_ticket"
          placeholder="Campo de texto"
          hide-bottom-space
        />
      </td>
    </tr>
    <tr>
      <td>Nombre del Ganador</td>
      <td>
        <q-input
          outlined
          dense
          v-model="configForm.winner_name"
          placeholder="Campo de texto"
          hide-bottom-space
        />
      </td>
    </tr>
    <tr>
      <td>Nombre del Vendedor Ganador</td>
      <td>
        <q-input
          outlined
          dense
          v-model="configForm.seller_winner_name"
          placeholder="Campo de texto"
          hide-bottom-space
        />
      </td>
    </tr>
    <tr>
      <td></td>
      <td class="flex justify-end">
        <q-btn
          class="q-my-md"
          color="primary"
          label="Guardar información"
          :loading="loading"
          @click="saveRaffle()"
        />
      </td>
    </tr>
  </q-markup-table>
</template>

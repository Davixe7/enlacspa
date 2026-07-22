<script setup>
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'
import { onMounted, ref } from 'vue'

const props = defineProps(['raffleId'])
const loading = ref(false)
const form = ref({
  raffle_id: props.raffleId,
  starts_at: 0,
  ends_at: 0,
  seller: { id: null, first_name: '', phone: '' }
})

async function fetchStart() {
  try {
    loading.value = true
    let response = (await api.get(`raffles/${props.raffleId}/startsAt`)).data.data
    form.value.starts_at = response
    console.log(response)
  } catch (error) {
    console.log(error)
    notify.negative('Error al cargar el punto de partida')
  } finally {
    loading.value = false
  }
}

async function fetchSeller() {
  try {
    loading.value = true
    let response = (await api.get(`raffle_sellers/?phone=${form.value.seller.phone}`)).data.data
    if (response.id) {
      form.value.seller = response
    }
  } catch (error) {
    console.log(error)
    form.value.seller.id = null
    form.value.seller.first_name = ''
    notify.negative('Error al cargar los datos del vendedor')
  } finally {
    loading.value = false
  }
}

async function assignTickets() {
  try {
    loading.value = true
    let route = `raffles/${props.raffleId}/assignTickets`
    let response = (await api.post(route, { ...form.value })).data.data
    console.log(response)
    notify.positive('Tickets asignados exitosamente')
  } catch (error) {
    console.log(error)
    notify.negative('Error al cargar los datos del vendedor')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStart()
})
</script>
<template>
  <q-markup-table flat>
    <tr>
      <td>Teléfono del vendedor</td>
      <td>
        <q-input
          outlined
          type="tel"
          v-model="form.seller.phone"
          hide-bottom-space
          @update:model-value="fetchSeller"
          debounce="500"
        >
          <template v-slot:append="">
            <q-icon
              v-if="!loading"
              name="search"
            />
            <q-spinner v-else></q-spinner>
          </template>
        </q-input>
      </td>
    </tr>
    <tr>
      <td>Nombre del vendedor</td>
      <td>
        <q-input
          outlined
          type="text"
          v-model="form.seller.first_name"
          hide-bottom-space
          :disable="!!form.seller.id"
        />
      </td>
    </tr>
    <tr>
      <td>Boleto inicio</td>
      <td>
        <q-input
          outlined
          type="number"
          v-model="form.starts_at"
          hide-bottom-space
          :disable="true"
        />
      </td>
    </tr>
    <tr>
      <td>Boleto fin</td>
      <td>
        <q-input
          outlined
          type="number"
          v-model="form.ends_at"
          hide-bottom-space
        />
      </td>
    </tr>
    <tr>
      <td
        colspan="2"
        style="height: 100px"
      >
        <q-btn
          color="primary"
          :loading="loading"
          @click="assignTickets"
          class="full-width"
          label="Asignar Tickets"
        />
      </td>
    </tr>
  </q-markup-table>
</template>

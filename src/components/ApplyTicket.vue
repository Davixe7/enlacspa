<script setup>
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'
import { ref } from 'vue'

const props = defineProps(['ticket'])
const emits = defineEmits(['saved'])
const localTicket = ref({ ...props.ticket })
const loading = ref(false)
const fetchingBuyer = ref(false)

async function fetchBuyer() {
  try {
    fetchingBuyer.value = true
    let route = `donors/?cellphone=${localTicket.value.buyer.cellphone}`
    let response = (await api.get(route)).data.data
    localTicket.value.buyer = response
  } catch (error) {
    if (error.response.status) {
      localTicket.value.buyer.first_name = ''
      localTicket.value.buyer.personal_email = ''
    }
  } finally {
    fetchingBuyer.value = false
  }
}

async function fetchSeller() {
  try {
    fetchingBuyer.value = true
    let route = `raffle_sellers/?phone=${localTicket.value.seller.phone}`
    let response = (await api.get(route)).data.data
    localTicket.value.seller = response
  } catch (error) {
    if (error.response.status) {
      localTicket.value.seller.first_name = ''
      localTicket.value.seller.email = ''
    }
  } finally {
    fetchingBuyer.value = false
  }
}

async function ApplyTicket() {
  try {
    loading.value = true
    let route = `raffle_tickets/${localTicket.value.id}`
    let response = (await api.post(route, { ...localTicket.value, _method: 'PUT' })).data.data
    console.log(response)
    emits('saved')
    notify.positive('Boleto capturado exitosamente')
  } catch (error) {
    console.log(error)
    notify.negative('Error al aplicar el boleto')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-markup-table flat>
    <tr>
      <td># Boleto</td>
      <td>
        <q-input
          v-model="localTicket.number"
          outlined
          hide-bottom-space
          disable
        />
      </td>
    </tr>
    <tr>
      <td style="width: 300px; white-space: wrap">
        Celular del comprador / Responsable de vaquita
      </td>
      <td>
        <q-input
          v-model="localTicket.buyer.cellphone"
          hide-bottom-space
          outlined
          @update:model-value="fetchBuyer"
          debounce="500"
        >
          <template v-slot:append="">
            <q-icon
              v-if="!fetchingBuyer"
              name="sym_o_search"
            />
            <q-spinner v-else></q-spinner>
          </template>
        </q-input>
      </td>
    </tr>
    <tr>
      <td>Nombre</td>
      <td>
        <q-input
          v-model="localTicket.buyer.first_name"
          outlined
          hide-bottom-space
          :disable="!!localTicket.buyer.id"
        />
      </td>
    </tr>
    <tr>
      <td>Correo Electrónico</td>
      <td>
        <q-input
          v-model="localTicket.buyer.personal_email"
          outlined
          hide-bottom-space
          :disable="!!localTicket.buyer.id"
        />
      </td>
    </tr>
    <tr>
      <td>Teléfono vendedor:</td>
      <td>
        <q-input
          v-model="localTicket.seller.phone"
          hide-bottom-space
          outlined
          @update:model-value="fetchSeller"
          debounce="500"
        >
          <template v-slot:append="">
            <q-icon
              v-if="!fetchingBuyer"
              name="sym_o_search"
            />
            <q-spinner v-else />
          </template>
        </q-input>
      </td>
    </tr>
    <tr>
      <td>Vendido por:</td>
      <td>
        <q-input
          v-model="localTicket.seller.first_name"
          outlined
          hide-bottom-space
        />
      </td>
    </tr>
    <tr>
      <td>Fecha de venta</td>
      <td>
        <q-input
          outlined
          dense
          type="date"
          v-model="localTicket.sold_at"
          hide-bottom-space
        />
      </td>
    </tr>
    <tr>
      <td>Comentarios</td>
      <td>
        <q-input
          outlined
          dense
          type="text"
          v-model="localTicket.comments"
          hide-bottom-space
        />
      </td>
    </tr>
  </q-markup-table>
  <div class="q-pa-sm">
    <div class="flex q-gutter-x-sm">
      <q-checkbox
        v-model.number="localTicket.cow"
        label="Vaquita"
        :true-value="1"
        :false-value="0"
      />
      <q-checkbox
        v-model.number="localTicket.deductible_receipt"
        label="Recibo Deducible"
        :true-value="1"
        :false-value="0"
      />
      <q-checkbox
        v-model.number="localTicket.enlac_collection"
        label="Cobranza ENLAC"
        :true-value="1"
        :false-value="0"
      />
    </div>

    <div class="flex justify-end q-px-sm">
      <q-btn
        color="primary"
        label="Guardar"
        :loading="loading"
        @click="ApplyTicket"
      />
    </div>
  </div>
</template>

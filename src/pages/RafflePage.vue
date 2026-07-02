<script setup>
import { api } from 'src/boot/axios'
import notify from 'src/utils/notify'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import SellerForm from 'src/components/SellerForm.vue'
import ApplyTicket from 'src/components/ApplyTicket.vue'
import ApplyDonationDialog from 'src/components/ApplyDonationDialog.vue'

const props = defineProps(['raffleId'])
const raffle = ref({})
const loading = ref(false)
const rows = ref([])
const route = useRoute()
const sellerDialog = ref(false)
const ticketDialog = ref(false)
const ticket = ref({})
const donationDialog = ref(null)

function selectTicket(row) {
  ticket.value = row
  ticket.value.buyer = ticket.value.buyer
    ? ticket.value.buyer
    : { id: null, first_name: '', cellphone: '' }

  ticket.value.seller = ticket.value.seller
    ? ticket.value.seller
    : { id: null, first_name: '', phone: '' }
  ticketDialog.value = true
}

async function fetchRaffle() {
  let apiRoute = props.raffleId
    ? `raffles/${props.raffleId}`
    : `raffles/?procuration_activity_id=${route.query.procuration_activity_id}`
  try {
    loading.value = true
    raffle.value = (await api.get(apiRoute)).data.data
    rows.value = raffle.value.tickets
  } catch (error) {
    console.log(error)
    notify.negative('Error al cargar los datos de la rifa')
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchRaffle())

const columns = ref([
  {
    align: 'left',
    name: 'number',
    label: '#',
    field: 'number'
  },
  {
    align: 'left',
    name: 'status',
    label: 'Estatus',
    field: 'status'
  },
  {
    align: 'left',
    name: 'seller',
    label: 'Vendedor',
    field: (row) => (row.seller ? row.seller.first_name : '')
  },
  {
    align: 'left',
    name: 'sold_at',
    label: 'Fecha de venta',
    field: (row) => row.sold_at ?? 'pendiente'
  },
  {
    align: 'left',
    name: 'buyer',
    label: 'Nombre del Comprador',
    field: (row) => (row.buyer ? row.buyer.first_name : '')
  },
  { align: 'left', name: 'cow', label: 'Vaquita', field: (row) => (row.cow ? 'Sí' : 'No') },
  {
    align: 'left',
    name: 'deductible_receipt',
    label: 'Recibo deducible',
    field: (row) => (row.deductible_receipt ? 'Sí' : 'No')
  },
  {
    align: 'left',
    name: 'enlac_collection',
    label: 'Cobranza ENLAC',
    field: (row) => (row.enlac_collection ? 'Sí' : 'No')
  },
  {
    align: 'left',
    name: 'paid_amount',
    label: 'Monto pagado',
    field: (row) => (row.donations_sum_amount ? `$ ${row.donations_sum_amount}` : '$ 0')
  },
  {
    align: 'left',
    name: 'receipt_number',
    label: 'Nro recibo',
    field: (row) => (row.payment ? row.payment.id : '')
  },
  {
    align: 'right',
    name: 'actions',
    label: ''
  }
])

const selectedFilterOption = ref('available')
const ticketStatuses = {
  '': { value: '', label: 'Todos', color: 'white' },
  'available': { value: 'available', label: 'Disponible', color: 'positive' },
  'sold': { value: 'sold', label: 'Vendido', color: 'negative' }
}

const results = computed(() => {
  if (selectedFilterOption.value == '') return [...rows.value]

  if (selectedFilterOption.value == 'available' || selectedFilterOption.value == 'sold') {
    return rows.value.filter((row) => row.status == selectedFilterOption.value)
  }

  if (selectedFilterOption.value == 'partial') {
    return rows.value.filter(
      (t) => t.donations_sum_amount > 0 && t.donations_sum_amount < raffle.value.ticket_price
    )
  }

  if (selectedFilterOption.value == 'total') {
    return rows.value.filter((t) => t.donations_sum_amount >= raffle.value.ticket_price)
  }

  return [...rows.value]
})

const soldCount = computed(() => {
  return rows.value.filter((t) => t.status == 'sold').length
})

const partialCount = computed(() => {
  return rows.value.filter(
    (t) => t.donations_sum_amount > 0 && t.donations_sum_amount < raffle.value.ticket_price
  ).length
})

const totalCount = computed(() => {
  return rows.value.filter((t) => t.donations_sum_amount >= raffle.value.ticket_price).length
})

function payTicket(row) {
  ticket.value = row
  donationDialog.value = true
}
</script>

<template>
  <div class="flex items-center">
    <div class="filter">
      <label for="">Filtrar por:</label>
      <div class="flex q-gutter-x-sm q-py-xs">
        <q-chip
          clickable
          :label="`Todos`"
          @click="selectedFilterOption = ''"
          :color="'' == selectedFilterOption ? 'blue-2' : 'grey-2'"
        />
        <q-chip
          clickable
          :label="`Vendidos ${soldCount}`"
          @click="selectedFilterOption = 'sold'"
          :color="'sold' == selectedFilterOption ? 'blue-2' : 'grey-2'"
        />
        <q-chip
          clickable
          :label="`Pago parcial ${partialCount}`"
          @click="selectedFilterOption = 'partial'"
          :color="'partial' == selectedFilterOption ? 'blue-2' : 'grey-2'"
        />
        <q-chip
          clickable
          :label="`Pago total ${totalCount}`"
          @click="selectedFilterOption = 'total'"
          :color="'total' == selectedFilterOption ? 'blue-2' : 'grey-2'"
        />
      </div>
      <div
        class="q-mb-md"
        style="font-size: 0.9rem; color: #404040"
      >
        Mostrando: {{ results.length }} boletos
      </div>
    </div>

    <q-btn
      flat
      rounded
      label="Asignar boletos"
      @click="sellerDialog = true"
      class="q-ml-auto"
    />
  </div>
  <q-table
    :columns="columns"
    :rows="results"
    :pagination="{ rowsPerPage: 0 }"
  >
    <template v-slot:body-cell-status="props">
      <q-td
        :class="`bg-${ticketStatuses[props.row.status].color}`"
        @click="selectTicket(props.row)"
      >
        {{ ticketStatuses[props.row.status].label }}
      </q-td>
    </template>
    <template v-slot:body-cell-actions="props">
      <q-td>
        <q-btn
          flat
          round
          dense
          icon="attach_money"
          :disable="!props.row.donor_id"
          @click="payTicket(props.row)"
        />
      </q-td>
    </template>
  </q-table>

  <q-dialog
    v-model="sellerDialog"
    position="right"
    full-height
  >
    <q-card>
      <q-card-section>
        <div class="page-title">Asignar Boletos</div>
      </q-card-section>
      <SellerForm :raffleId="raffle.id" />
    </q-card>
  </q-dialog>

  <q-dialog
    v-model="ticketDialog"
    position="bottom"
  >
    <q-card style="width: 620px">
      <q-card-section>
        <div class="page-title">Captura de Boleto</div>
      </q-card-section>

      <ApplyTicket
        :ticket="ticket"
        @saved="
          () => {
            fetchRaffle()
            ticketDialog = false
          }
        "
      />
    </q-card>
  </q-dialog>

  <q-dialog v-model="donationDialog">
    <ApplyDonationDialog
      :raffle-ticket-id="ticket.id"
      @saved="
        () => {
          fetchRaffle()
          donationDialog = false
        }
      "
    />
  </q-dialog>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { api } from 'src/boot/axios'
import SponsorPicker from 'pages/beneficiaries/SponsorPicker.vue'

const dialog = ref(false)
const props = defineProps({
  candidateId: { type: String, required: false },
  readonly: { type: Boolean, default: false }
})
const paymentConfigs = ref([])
const except = computed(() => paymentConfigs.value.map((item) => item.sponsor.id))

onMounted(async () => {
  let response = (await api.get(`payment_configs/?candidate_id=${props.candidateId}`)).data.data
  paymentConfigs.value = response.filter((paymentConfig) => !!paymentConfig.sponsor_id)
})
</script>

<template>
  <SponsorPicker
    :except="except"
    v-model="dialog"
    @close="dialog = false"
  />
  <q-card
    bordered
    style="display: flex; flex-flow: column nowrap; height: 100%"
  >
    <q-card-section>
      <div class="page-subtitle q-my-none">Padrinos</div>
    </q-card-section>
    <q-markup-table>
      <tbody>
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
              >Editar
            </router-link>
          </td>
        </tr>
      </tbody>
    </q-markup-table>
    <q-card-section class="flex justify-end q-mt-auto">
      <q-btn
        :disable="props.readonly"
        flat
        color="primary"
        icon="sym_o_add"
        @click="dialog = true"
        >Asociar padrino</q-btn
      >
      <q-btn
        :disable="props.readonly"
        unelevated
        class="q-ml-md"
        color="primary"
        icon="sym_o_add"
        to="registrar-padrino"
        >Registrar nuevo</q-btn
      >
    </q-card-section>
  </q-card>
</template>

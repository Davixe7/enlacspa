<script setup>
import { api } from 'src/boot/axios'
import { computed, onMounted, ref } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  except: { type: Array, default: () => [] }
})
const emits = defineEmits(['close', 'change'])

onMounted(() => {
  fetchSponsors()
})

const sponsor = computed(() => sponsors.value.find((s) => s.id == sponsorId.value))
const staging = ref(false)
const sponsorId = ref(null)
const loading = ref(false)
const sponsors = ref([])
const rows = computed(() => sponsors.value.filter((item) => !props.except.includes(item.id)))

async function fetchSponsors() {
  try {
    loading.value = true
    sponsors.value = (await api.get(`/sponsors`)).data.data
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <q-dialog
    :modelValue="modelValue"
    @hide="emits('close')"
  >
    <q-card
      style="width: 400px"
      v-if="staging"
    >
      <q-card-section class="q-pb-none">
        <div class="flex justify-center">
          <div class="page-title q-mb-none">Confirmar seleccion</div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="text-center q-gutter-y-md">
          <div>Confirma que desea vincular a</div>
          <div>
            <q-icon
              name="sym_o_account_circle"
              size="40px"
            />
          </div>
          <div class="text-primary text-bold">
            {{ sponsor.full_name }}
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="flex justify-center">
          <q-btn
            outline
            color="primary"
            class="q-mr-md"
            @click="staging = false"
            >Cancelar</q-btn
          >
          <q-btn
            color="primary"
            @click="$router.push(`padrinos/${sponsorId}`)"
            >Confirmar</q-btn
          >
        </div>
      </q-card-section>
    </q-card>

    <q-card
      v-else
      style="width: 400px"
    >
      <q-card-section class="q-pb-none">
        <div class="flex justify-between items-center">
          <div class="page-title q-my-none">Asociar un padrino</div>
          <q-btn
            flat
            round
            dense
            icon="sym_o_close"
            @click="emits('close')"
          />
        </div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="q-mb-md"
          outlined
          stack-label
          label="Buscar por nombre"
        >
          <template v-slot:prepend>
            <q-icon name="sym_o_search" />
          </template>
        </q-input>
        <q-list separator>
          <q-item
            clickable
            v-for="sponsor in rows"
            :key="sponsor.id"
          >
            <q-item-section>
              <q-item-label>{{ sponsor.full_name }}</q-item-label>
              <q-item-label caption>{{ sponsor.company_name }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-radio
                v-model="sponsorId"
                :val="sponsor.id"
              />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
      <q-card-section>
        <div class="flex justify-end">
          <q-btn
            :disable="!sponsorId"
            color="primary"
            @click="staging = true"
            >Continuar</q-btn
          >
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

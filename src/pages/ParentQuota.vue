<script setup>
import { api } from 'src/boot/axios'
import EnlacDate from 'src/components/EnlacDate.vue'
import notify from 'src/utils/notify'
import { onMounted, ref } from 'vue'

const errors = ref({})
const loading = ref(false)
const quota = ref({})
const quotas = ref([])

async function fetchQuota() {
  try {
    loading.value = true
    let response = (await api.get('/parent-quota-updates')).data.data
    quotas.value = [...response]
    quota.value = quotas.value.length ? quotas.value.find((q) => q.applied == 0) : {}
    quotas.value = quotas.value.filter((q) => q.applied == 1)
  } catch (error) {
    console.log(error)
  } finally {
    loading.value = false
  }
}

async function updateQuota() {
  try {
    loading.value = true
    quota.value = (await api.post('/parent-quota-updates', { ...quota.value })).data.data
    notify.positive('Guardado con éxito')
  } catch (error) {
    console.log(error)
    notify.negative('No se pudo guardar la actualización')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchQuota()
})
</script>

<template>
  <h1 class="page-title">Ajuste de Cuota de Padres</h1>
  <q-card class="q-mb-md">
    <q-card-section class="flex items-center">
      <div>
        <div
          class="q-mb-xs"
          style="font-size: 0.9rem"
        >
          Proxima ejecución
        </div>
        <div
          class="font-weight-medium"
          style="font-size: 20px"
        >
          364 días 23h 44m 00s
        </div>
      </div>
      <div class="q-ml-auto flex items-center">
        <q-input
          outlined
          v-model="quota.amount"
          hide-bottom-space
          :error="!!errors['amount']"
          :error-message="errors['amount']"
          type="number"
          prefix="$"
          class="q-mr-md"
        />
        <EnlacDate
          outlined
          v-model="quota.valid_since"
          hide-bottom-space
          :limit-to-past="false"
          :error="!!errors['valid_since']"
          :error-message="errors['valid_since']"
          class="q-mr-md"
        />
        <q-btn
          color="primary"
          label="Guardar cambios"
          :loading="loading"
          @click="updateQuota"
        />
      </div>
    </q-card-section>
  </q-card>
  <div>
    <q-card>
      <q-card-section class="flex items-center">
        <q-icon
          name="sym_o_history"
          class="q-mr-sm"
        />
        <span class="font-weight-medium">Historial de Incrementos</span>
        <q-btn
          flat
          round
          dense
          icon="sym_o_more_vert"
          class="q-ml-auto"
        />
      </q-card-section>
      <q-list
        class="q-pb-md q-px-sm"
        separator
      >
        <q-item
          v-for="item in quotas"
          :key="item.id"
        >
          <q-item-section>
            <q-item-label> {{ item.valid_since }} 00:00:00 </q-item-label>
            <q-item-label caption> $ {{ item.amount }} </q-item-label>
          </q-item-section>
          <q-item-section side>
            <q-icon
              size="1.5rem"
              name="sym_o_check_circle"
              color="positive"
            />
          </q-item-section>
        </q-item>
      </q-list>
      <q-separator></q-separator>
    </q-card>
  </div>
</template>

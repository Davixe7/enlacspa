<template>
  <q-input
    filled
    v-model="dateDisplay"
    mask="##/##/####"
    v-bind="$attrs"
  >
    <template v-slot:append>
      <q-icon
        name="event"
        class="cursor-pointer"
      >
        <q-popup-proxy
          cover
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date
            v-model="proxyModel"
            mask="YYYY-MM-DD"
            :options="limitToPast"
          >
            <div class="row items-center justify-end">
              <q-btn
                v-close-popup
                label="Cerrar"
                color="primary"
                flat
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup>
import { computed } from 'vue'
import { DateTime } from 'luxon'

const limitToPast = (dateString) => {
  const dateToCheck = DateTime.fromFormat(dateString, 'yyyy/MM/dd')
  const today = DateTime.now().startOf('day')
  return dateToCheck <= today
}

// (en formato ISO)
const model = defineModel({ type: String, default: '' })

// Proxy para el q-date para evitar mutaciones directas extrañas
const proxyModel = computed({
  get: () => model.value,
  set: (val) => {
    model.value = val
  }
})

const dateDisplay = computed({
  get() {
    if (!model.value) return ''
    return DateTime.fromISO(model.value).toFormat('dd/MM/yyyy')
  },
  set(val) {
    if (!val || val.length < 10) return
    const parsed = DateTime.fromFormat(val, 'dd/MM/yyyy')
    if (parsed.isValid) {
      model.value = parsed.toISODate()
    }
  }
})
</script>

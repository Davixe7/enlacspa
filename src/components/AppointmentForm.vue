<script setup>
import { DateTime } from 'luxon';
import { Notify } from 'quasar';
import { api } from 'src/boot/axios';
import { computed, onMounted, ref } from 'vue';

defineProps(['candidates'])
const emits = defineEmits(['close'])
const loading = ref(false)
const errors = ref({})
const evaluators = ref([])
const appointment = ref({})

onMounted(async () => {
  evaluators.value = (await api.get('evaluators')).data.data
})

const fulldatetime = computed(() => {
  let newDate = DateTime.fromFormat(date.value + ' ' + time.value, 'dd/MM/yyyy hh:mm')
  return newDate.toISO()
})
const date = ref(DateTime.now().toFormat('dd/MM/yyyy'))
const time = ref(DateTime.now().toFormat('hh:mm'))

/* watch(() => appointment.value, newValue => {
  let luxonDate = DateTime.fromISO(newValue.date)
  date.value = luxonDate.toFormat('DD/MM/YYYY')
  time.value = luxonDate.toFormat('H:i:s')
}) */

async function storeAppointment() {
  loading.value = true
  errors.value = {}
  try {
    await api.post('appointments', { ...appointment.value, date: fulldatetime.value })
    Notify.create({ caption: 'Guardado con exito', icon: 'sym_o_check_circle', iconColor: 'positive' })
    emits('close')
  } catch (error) {
    console.log(error);
    errors.value = error.formatted ? error.formatted : {}
    Notify.create({ caption: 'Por favor, valide la informacion', icon: 'sym_o_info', iconColor: 'negative' })
  }
  loading.value = false
}
</script>

<template>
  <q-card style="width: 500px;">
    <q-card-section>
      <div class="page-title page-title--no-margin flex items-center">
        <q-icon
          name="calendar_today"
          class="q-mr-sm"
        ></q-icon>
        Programar cita
      </div>
    </q-card-section>
    <q-card-section class="q-gutter-y-md">
      <q-select
        outlined
        stack-label
        label="Candidatos"
        :options="candidates"
        v-model="appointment.candidate_id"
        emit-value
        option-label="full_name"
        option-value="id"
        map-options
      ></q-select>

      <q-select
        outlined
        stack-label
        label="Tipo de cita"
        :options="[{ name: 'Unico tipo de cita', id: 1 }]"
        v-model="appointment.type_id"
        emit-value
        option-label="name"
        option-value="id"
        map-options
      ></q-select>

      <q-select
        outlined
        stack-label
        label="Atendera"
        :options="evaluators"
        v-model="appointment.evaluator_id"
        emit-value
        option-label="name"
        option-value="id"
        map-options
      ></q-select>

      <q-input
        outlined
        stack-label
        v-model="date"
        label="Seleccione fecha"
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
                v-model="date"
                mask="DD/MM/YYYY"
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

      <q-input
        outlined
        stack-label
        v-model="time"
        label="Horario"
      >
        <template v-slot:append>
          <q-icon
            name="access_time"
            class="cursor-pointer"
          >
            <q-popup-proxy
              cover
              transition-show="scale"
              transition-hide="scale"
            >
              <q-time v-model="time">
                <div class="row items-center justify-end">
                  <q-btn
                    v-close-popup
                    label="Cerrar"
                    color="primary"
                    flat
                  />
                </div>
              </q-time>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>

      <q-input
        outlined
        stack-label
        label="Observaciones"
        v-model="appointment.comments"
        type="textarea"
      ></q-input>
    </q-card-section>
    <q-card-section class="flex justify-end">
      <q-btn
        @click="emits('close')"
        class="q-mr-sm"
        unelevated
        outline
        color="primary"
      >Cerrar</q-btn>
      <q-btn
        @click="storeAppointment"
        unelevated
        color="primary"
      >Guardar</q-btn>
    </q-card-section>
  </q-card>
</template>

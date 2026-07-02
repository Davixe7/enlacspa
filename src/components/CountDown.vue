<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'

const props = defineProps({
  // "Y-m-d H:i:s" o timestamp en milisegundos
  targetDate: {
    type: [String, Number],
    required: true
  }
})

const emit = defineEmits(['expired'])

const timeLeft = ref({
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
})

let timerInterval = null

// Convertir la prop a un objeto Date de JavaScript de forma segura
const targetTime = computed(() => {
  if (typeof props.targetDate === 'string') {
    // Espacios por 'T' aseguran compatibilidad cross-browser del formato Y-m-d H:i:s
    return new Date(props.targetDate.replace(' ', 'T'))
  }
  return new Date(props.targetDate)
})

// Computed para saber si ya expiró
const isTimeUp = ref(false)

const calculateTimeLeft = () => {
  const now = new Date().getTime()
  const difference = targetTime.value.getTime() - now

  if (difference <= 0) {
    isTimeUp.value = true
    timeLeft.value = { days: 0, hours: 0, minutes: 0, seconds: 0 }
    if (timerInterval) clearInterval(timerInterval)
    emit('expired')
    return
  }

  isTimeUp.value = false

  // Cálculos matemáticos para pasar de milisegundos a unidades de tiempo
  timeLeft.value = {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((difference % (1000 * 60)) / 1000)
  }
}

const formatNumber = (num) => String(num).padStart(2, '0')

onMounted(() => {
  calculateTimeLeft() // Ejecución inicial inmediata
  timerInterval = setInterval(calculateTimeLeft, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<template>
  <div class="countdown-container">
    <div
      v-if="!isTimeUp"
      class="countdown-timer"
    >
      <div class="time-block">
        <span class="time-value">{{ formatNumber(timeLeft.days) }}</span>
        <span class="time-label">Días</span>
      </div>
      <div class="time-block">
        <span class="time-value">{{ formatNumber(timeLeft.hours) }}</span>
        <span class="time-label">Horas</span>
      </div>
      <div class="time-block">
        <span class="time-value">{{ formatNumber(timeLeft.minutes) }}</span>
        <span class="time-label">Minutos</span>
      </div>
      <div class="time-block">
        <span class="time-value">{{ formatNumber(timeLeft.seconds) }}</span>
        <span class="time-label">Segundos</span>
      </div>
    </div>

    <div
      v-else
      class="countdown-expired"
    >
      <slot name="expired">No hay incremento programado</slot>
    </div>
  </div>
</template>

<style scoped>
.countdown-timer {
  display: flex;
  gap: 0px;
  justify-content: center;
  /* font-family: Arial, sans-serif; */
}

.time-block {
  display: flex;
  align-items: flex-end;
  /* background: #2c3e50; */
  /* border: 1px solid #000; */
  color: #2c3e50;
  padding: 8.5px 5px;
  border-radius: 5px;
  min-width: 60px;
}

.time-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 0.5rem;
}

.time-label {
  font-size: 0.8rem;
  /* text-transform: uppercase; */
  opacity: 0.8;
}

.countdown-expired {
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #e74c3c;
}
</style>

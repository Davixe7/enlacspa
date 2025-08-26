<script setup>
import { useCandidateStore } from 'src/stores/candidate-store'
import { computed } from 'vue'

const props = defineProps(['ranks', 'evaluationFields'])
const cellMonthsMap = {
  7: 0.25,
  8: 0.5,
  9: 1.0,
  10: 1.5,
  11: 2.0,
  12: 2.5,
  13: 3.25,
  14: 4.0,
  15: 4.75,
  16: 5.5,
  17: 6.25,
  18: 7.0,
  19: 7.75,
  20: 8.5,
  21: 9.25,
  22: 10.0,
  23: 11.0,
  24: 12.0,
  25: 13.0,
  26: 14.0,
  27: 15.0,
  28: 16.0,
  29: 17.0,
  30: 18.0,
  31: 21.0,
  32: 24.0,
  33: 27.0,
  34: 30.0,
  35: 33.0
}

const store = useCandidateStore()
const chronologicalAge = store.chronological_age
  ? store.chronological_age.split('.')[0] + ' meses'
  : 0
const chronologicalAge2 = store.chronological_age2
  ? store.chronological_age2.split('.')[0] + ' años'
  : 0

const developmentRateA = computed(() => {
  let evaluated = props.ranks.length
  let evaluatedFP = props.ranks.filter((rank) => ['F', 'P'].includes(rank.caracteristic)).length
  if (evaluatedFP <= 5) {
    return 'Menos que recién nacido.'
  }
  if (evaluatedFP == 6) {
    return 'Recién nacido.'
  }
  let months = cellMonthsMap[evaluatedFP]
  return ((months / evaluated) * 100).toFixed(2)
})

const developmentRateB = computed(() => {
  let evaluated = props.ranks.length
  let evaluatedFP = props.ranks.filter((rank) => ['F', 'P'].includes(rank.caracteristic)).length
  if (evaluatedFP <= 5) {
    return 'Menos que recién nacido.'
  }
  if (evaluatedFP == 6) {
    return 'Recién nacido.'
  }
  let months = cellMonthsMap[evaluatedFP]
  return ((months / evaluated) * 100).toFixed(2)
})

const neurologicalAge = computed(() =>
  ((store.chronological_age * developmentRateA.value) / 100).toFixed(2)
)
const neurologicalAge2 = computed(() => (neurologicalAge.value / 12).toFixed(2))
const developmentRate = computed(() =>
  ((neurologicalAge.value / store.chronological_age) * 100).toFixed(2)
)
const damageExtension = computed(() => {
  let brainFunctions = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false }
  props.ranks.map((rank) => {
    if (!['F', '0'].includes(rank.caracteristic)) return
    brainFunctions[rank.brain_function_id] = true
  })
  let count = Object.values(brainFunctions).filter((val) => val).length
  return {
    0: 'No hay daño',
    1: 'Focal',
    2: 'Relativamente Focal',
    3: 'Semifocal',
    4: 'Semidifusa',
    5: 'Relativamente Difusa',
    6: 'Difusa'
  }[count]
})
const damageGrade = computed(() => {
  let damageGrades = {
    Completa: [0],
    Profunda: [0.0001, 25],
    Severa: [25.0001, 50],
    Moderada: [50.0001, 75],
    Leve: [75.0001, 99]
  }

  if (developmentRate.value <= 0) {
    return 'Completa'
  }

  if (developmentRate.value > 99) {
    return 'Leve'
  }

  for (const clave in damageGrades) {
    const rango = damageGrades[clave]
    if (rango.length === 1 && developmentRate.value === rango[0]) {
      return clave
    } else if (
      rango.length === 2 &&
      developmentRate.value >= rango[0] &&
      developmentRate.value <= rango[1]
    ) {
      return clave
    }
  }
  return null
})
const damageLaterality = computed(() => {
  var lateralities = { l: false, r: false }
  props.ranks.map((rank) => {
    if (!['F', '0'].includes(rank.caracteristic)) return
    lateralities[rank.laterality_impact] = true
  })
  return Object.values(lateralities).filter((val) => val).length > 1 ? 'Bilateral' : 'Unilateral'
})

const damageLevel = computed(() => {
  let damageLog = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false }
  props.ranks.map((rank) =>
    ['F', '0'].includes(rank.caracteristic) ? (damageLog[rank.brain_level_id] = true) : ''
  )
  let damagedLevelIds = Object.keys(damageLog).filter((key) => damageLog[key])
  return props.evaluationFields.filter((level) => damagedLevelIds.includes(String(level.id)))
})
</script>

<template>
  <div class="page-title q-mb-md">Diagnóstico Funcional</div>

  <div
    class="row q-col-gutter-xl q-mb-xl"
    style="padding-top: 1px"
  >
    <div class="col-12 col-md-3">
      <q-input
        outlined
        stack-label
        label="Edad cronológica (meses)"
        :modelValue="chronologicalAge"
      ></q-input>
    </div>

    <div class="col-12 col-md-3">
      <q-input
        outlined
        stack-label
        label="Edad cronológica (años)"
        :modelValue="chronologicalAge2"
      ></q-input>
    </div>

    <div class="col-12 col-md-3">
      <q-input
        outlined
        stack-label
        label="Edad neurológica (meses)(*)"
        :modelValue="neurologicalAge + ' meses'"
      ></q-input>
    </div>

    <div class="col-12 col-md-3">
      <q-input
        outlined
        stack-label
        label="Edad neurológica (años)(*)"
        :modelValue="neurologicalAge2 + ' años'"
      ></q-input>
    </div>

    <div class="col-12 col-md-3">
      <q-input
        outlined
        stack-label
        label="Extension de la lesion(*)"
        :modelValue="damageExtension"
      ></q-input>
    </div>

    <div class="col-12 col-md-3">
      <q-input
        outlined
        stack-label
        label="Grado de la lesion(*)"
        :modelValue="damageGrade"
      ></q-input>
    </div>

    <div class="col-12 col-md-3">
      <q-input
        outlined
        stack-label
        label="Tasa de desarrollo (sin N/A)"
        :modelValue="developmentRateA + '%'"
      ></q-input>
    </div>

    <div class="col-12 col-md-3">
      <q-input
        outlined
        stack-label
        label="Tasa de desarrollo (con N/A)"
        :modelValue="developmentRateB + '%'"
      ></q-input>
    </div>
  </div>

  <div class="row q-col-gutter-xl q-mb-xl">
    <div class="col-12 col-md-3">
      <q-input
        outlined
        stack-label
        label="Lateralidad"
        :modelValue="damageLaterality"
      ></q-input>
    </div>
    <div class="col-12 col-md-3">
      <label
        for="#"
        style="font-weight: 400; font-size: 14px; margin-bottom: 0.5rem"
        >Nivel de la lesion</label
      >
      <ul style="margin: 0; padding: 0 0 0 1rem">
        <li
          v-for="item in damageLevel"
          :key="item.id"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

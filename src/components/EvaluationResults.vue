<script setup>
import { useCandidateStore } from 'src/stores/candidate-store';
import { computed } from 'vue';

const props = defineProps(['ranks', 'evaluationFields'])

const store = useCandidateStore()
const chronologicalAge = store.chronological_age ? store.chronological_age.split('.')[0] + ' meses' : 0
const neurologicalAge = computed(() => props.ranks.reduce((age, rank) => rank.caracteristic == '0' ? age : age + 1, 0))
const developmentRate = computed(() => ((neurologicalAge.value / store.chronological_age) * 100).toFixed(2))
const damageExtension = computed(() => {
  let brainFunctions = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false }
  props.ranks.map(rank => {
    if (!['F', '0'].includes(rank.caracteristic)) return
    brainFunctions[rank.brain_function_id] = true
  })
  let count = Object.values(brainFunctions).filter(val => val).length;
  return ({
    0: 'No hay daño',
    1: 'Focal',
    2: 'Relativamente Focal',
    3: 'Semifocal',
    4: 'Semidifusa',
    5: 'Relativamente Difusa',
    6: 'Difusa',
  })[count]
})
const damageGrade = computed(() => {
  let damageGrades = {
    "Completa": [0],
    "Profunda": [0.0001, 25],
    "Severa": [25.0001, 50],
    "Moderada": [50.0001, 75],
    "Leve": [75.0001, 99]
  }

  if (developmentRate.value <= 0) {
    return 'Completa';
  }

  if (developmentRate.value > 99) {
    return 'Leve';
  }

  for (const clave in damageGrades) {
    const rango = damageGrades[clave];
    if (rango.length === 1 && developmentRate.value === rango[0]) {
      return clave;
    }
    else if (rango.length === 2 && developmentRate.value >= rango[0] && developmentRate.value <= rango[1]) {
      return clave;
    }
  }
  return null;
});
const damageLaterality = computed(() => {
  var lateralities = { "l": false, "r": false }
  props.ranks.map(rank => {
    if (!['F', '0'].includes(rank.caracteristic)) return
    lateralities[rank.laterality_impact] = true
  })
  return Object.values(lateralities).filter(val => val).length > 1 ? 'Bilateral' : 'Unilateral';
})

const damageLevel = computed(() => {
  let damageLog = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false, 7: false }
  props.ranks.map(rank => ['F', '0'].includes(rank.caracteristic) ? damageLog[rank.brain_level_id] = true : '')
  let damagedLevelIds = Object.keys(damageLog).filter(key => damageLog[key])
  return props.evaluationFields.filter(level => damagedLevelIds.includes(String(level.id)))
})

</script>

<template>
  <div class="page-title q-mb-md">Diagnostico Funcional</div>

  <div
    class="row q-col-gutter-xl q-mb-xl"
    style="padding-top: 1px;"
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
        label="Edad neurológica (meses)(*)"
        :modelValue="neurologicalAge + ' meses'"
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
        label="Tasa de desarrollo (por formula)(*)"
        :value="developmentRate"
      ></q-input>
    </div>

    <div class="col-12 col-md-3">
      <q-input
        outlined
        stack-label
        label="Tasa de desarrollo (por conteo)(*)"
        :modelValue="developmentRate + '%'"
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
        style="font-weight: 400; font-size: 14px; margin-bottom: .5rem;"
      >Nivel de la lesion</label>
      <ul style="margin: 0; padding: 0 0 0 1rem;">
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

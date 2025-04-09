<script setup>
import { computed } from 'vue';
const props = defineProps(['rows', 'brainFunctions'])

const commentsByFunction = computed(() => {
  let comments = {}
  props.rows.forEach(row => {
    props.brainFunctions.forEach(brainFunc => {
      if (row.ranks[brainFunc.id].comments) {
        comments[brainFunc.id] = comments[brainFunc.id]
          ? comments[brainFunc.id] + ',' + row.ranks[brainFunc.id].comments
          : row.ranks[brainFunc.id].comments
      }
    })
  })
  return comments
})
</script>

<template>
  <div class="page-title">Comentarios de la evaluación</div>
  <div class="q-gutter-y-xl">
    <q-input
      v-for="brainFunctionId in Object.keys(commentsByFunction)"
      :key="brainFunctionId"
      type="textarea"
      :label="brainFunctions.find(func => func.id == brainFunctionId).name"
      stack-label
      outlined
      v-model="commentsByFunction[brainFunctionId]"
      class="q-mb-lg"
    ></q-input>
  </div>
</template>

<style>
.q-gutter-y-xl {
  margin-top: initial;
}

.q-gutter-y-xl> :first-child {
  margin-top: 0;
}
</style>

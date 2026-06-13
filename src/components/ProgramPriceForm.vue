<script setup>
import EnlacDate from 'src/components/EnlacDate.vue'
</script>
<template>
  <q-markup-table>
    <tbody>
      <tr>
        <td>A partir del</td>
        <td>
          <EnlacDate
            outlined
            v-model="model.valid_since"
            hide-bottom-space
            :limit-to-past="false"
            :error="!!errors['valid_since']"
            :error-message="errors['valid_since']"
          />
        </td>
      </tr>
    </tbody>
  </q-markup-table>
</template>

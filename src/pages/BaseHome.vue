<script setup>
import { useAuthStore } from 'src/stores/user-store'
import HomePage from './HomePage.vue'
import EmployeeHome from './EmployeeHome.vue'
const store = useAuthStore()
</script>

<template>
  <HomePage v-if="!store.can('rides.index')" />
  <EmployeeHome v-else />
</template>

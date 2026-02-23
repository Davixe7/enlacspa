<script setup>
import { useAuthStore } from 'src/stores/user-store'
import HomePage from './HomePage.vue'
import EmployeeHome from './EmployeeHome.vue'
const auth = useAuthStore()
</script>

<template>
  <HomePage v-if="auth.authMode == 'admin'" />
  <EmployeeHome v-else />
</template>

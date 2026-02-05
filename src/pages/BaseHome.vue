<script setup>
import { useAuthStore } from 'src/stores/user-store'
import HomePage from './HomePage.vue'
import EmployeeHome from './EmployeeHome.vue'
import { ref, computed } from 'vue'
const auth = useAuthStore()
const user = computed(() => auth.data?.user)

const employeeRoles = ref(['driver', 'coordinacion_fisica', 'titular_de_expresion_artistica', 'coordinacion_academica'])
</script>

<template>
  <HomePage v-if="!employeeRoles.includes(user?.role?.name)" />
  <EmployeeHome v-else />
</template>

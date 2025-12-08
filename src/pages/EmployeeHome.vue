<script setup>
import { useAuthStore } from 'src/stores/user-store'
import { computed } from 'vue'
import { ref } from 'vue'

const auth = useAuthStore()
const options = ref([
  { role: '', path: '', label: 'ÁREA FÍSICA' },
  { role: '', path: '', label: 'NATACIÓN' },
  { role: '', path: '', label: 'ÁREA ACADÉMICA' },
  { role: '', path: '', label: 'EQUINOTERAPIA' },
  { role: 'driver', path: 'rides-rubio', label: 'TRASLADO CUAUHTÉMOC-RUBIO' },
  { role: 'driver', path: 'rides-equinetherapy', label: 'TRASLADO EQUINOTERPIA' }
])
const user = computed(() => auth.data?.user)
</script>

<template>
  <q-page>
    <h1 class="page-title">Seleccione el área:</h1>
    <div class="row q-col-gutter-md">
      <template
        v-for="option in options"
        :key="option.id"
      >
        <div
          v-if="user?.role?.name == option.role"
          class="col-12 col-sm-6"
        >
          <router-link
            :to="option.path"
            style="text-decoration: none !important"
          >
            <q-card
              bordered
              flat
            >
              <q-card-section>
                <div class="page-subtitle q-mb-0">
                  {{ option.label }}
                </div>
              </q-card-section>
            </q-card>
          </router-link>
        </div>
      </template>
    </div>
  </q-page>
</template>

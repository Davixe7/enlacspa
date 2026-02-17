<script setup>
import { useCategoryStore } from 'src/stores/category-store'
import { useAuthStore } from 'src/stores/user-store'
import { ref, computed, onMounted } from 'vue'

const categoryStore = useCategoryStore()
const auth = useAuthStore()

const areaPermissions = ref({
  8: [1, 4, 5, 6],
  4: [3],
  7: [2],
})

const driverOptions = [
  { role: 'driver', path: 'rides-rubio', label: 'TRASLADO CUAUHTÉMOC-RUBIO' },
  { role: 'driver', path: 'rides-equinetherapy', label: 'TRASLADO EQUINOTERPIA' }
]

const categoryOptions = computed(() => {
  if (categoryStore.categories.length == 0) return []
  return categoryStore.categories
    .map((item) => ({ ...item, path: `area/${item.name}/calificar` }))
    .concat(driverOptions)
})

function isAllowed(option){
  let allowedByArea = areaPermissions.value[auth.data.user.work_area_id] && areaPermissions.value[auth.data.user.work_area_id].some((allowed) => allowed == option.id)
  let allowedByRoleName = auth.data.user.role.name == option.role
  return allowedByArea || allowedByRoleName
}

onMounted(async () => {
  await categoryStore.fetchCategories({ base_only: 1 })
})
</script>

<template>
  <q-page>
    <h1 class="page-title">Seleccione el área:</h1>
    <div class="row q-col-gutter-md">
      <template
        v-for="option in categoryOptions"
        :key="option.id"
      >
        <div
          v-if="isAllowed(option)"
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

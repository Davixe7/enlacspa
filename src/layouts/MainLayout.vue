<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar style="padding: 36px 32px">
        <router-link to="/home">
          <q-img
            src="/logo_header.png"
            width="72px"
          />
        </router-link>

        <div class="q-toolbar__title-container">
          <q-toolbar-title> ENLAC </q-toolbar-title>
          <div class="q-toolbar__subtitle">Portal web para la administración y gestión</div>
        </div>

        <q-btn
          flat
          round
          icon="sym_o_siren"
          class="q-ml-md"
          @click="issuesDialog = true"
          v-if="route.name == 'scores.create'"
        />

        <q-btn
          flat
          round
          icon="sym_o_notifications"
          class="q-mx-md"
          to="/notificaciones"
        >
          <q-badge
            v-if="notificationStore.unreadNotificationsCount"
            color="red"
            floating
            rounded
          >
            {{ notificationStore.unreadNotificationsCount }}
          </q-badge>
        </q-btn>

        <q-avatar
          v-if="authStore.data.user"
          size="52px"
          text-color="white"
          color="grey"
        >
          {{ authStore.data.user.name.charAt(0).toUpperCase() }}
        </q-avatar>

        <AdminMenu />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-dialog v-model="issuesDialog">
        <q-card style="width: 480px">
          <q-card-section class="flex items-center">
            <q-icon
              name="sym_o_siren"
              class="q-mr-sm"
              size="1.25rem"
            />
            <h1 class="page-subtitle q-my-none">Registrar Incidencia</h1>
            <q-btn
              @click="issuesDialog = false"
              icon="close"
              flat
              round
              dense
              class="q-ml-auto"
            />
          </q-card-section>
          <IssuesForm @close="issuesDialog = false" />
        </q-card>
      </q-dialog>
      <div
        style="padding: 32px"
        v-if="!route.meta.hideBreadcrumb"
      >
        <q-breadcrumbs>
          <q-breadcrumbs-el
            v-for="rt in matchedRoutes"
            :key="rt.path"
            :label="rt.meta.label"
            :icon="rt.meta.icon"
            :to="rt.name ? { name: rt.name, props: rt.props } : null"
          />
        </q-breadcrumbs>
      </div>

      <div :style="{ padding: route.meta.noPadding ? 0 : '16px 32px 32px' }">
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import AdminMenu from './AdminMenu.vue'
import { useAuthStore } from 'src/stores/user-store'
import { useNotificationStore } from 'src/stores/notification-store'
import IssuesForm from 'src/components/IssuesForm.vue'

import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useMeta } from 'quasar'

const route = useRoute()
const issuesDialog = ref(false)

onMounted(() => {
  route.matched.forEach((rt) => console.log(rt.name + ' ' + rt.path))
  authStore.fetchUser()
  useNotificationStore().fetchNotifications()
  useMeta(() => ({ title: route.meta.label }))
})

const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const matchedRoutes = computed(() =>
  route.matched.filter((rt) => Boolean(!rt.meta.hideBreadcrumbEl))
)
</script>

<style>
.q-toolbar__title {
  font-weight: 700;
  font-size: 38px;
  line-height: 1em;
  letter-spacing: 0;
  overflow: visible;
  padding: 0;
  flex: initial;
}

.q-toolbar__title-container {
  flex: 1 1 auto;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 40px;
}

.q-toolbar__subtitle {
  font-weight: 500;
  font-size: 18px;
}

.q-item__section--avatar {
  min-width: fit-content;
}

.q-item__section--side {
  padding-right: 8px;
}

.q-item__section--side > .q-icon {
  font-size: 16px;
}

.q-item__section--main {
  font-size: 14px;
}
</style>

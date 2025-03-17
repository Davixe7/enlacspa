<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar
        color="red"
        style="padding: 36px 32px"
      >
        <router-link to="/home">
          <q-img
            src="/logo_header.png"
            width="72px"
          ></q-img>
        </router-link>

        <div class="q-toolbar__title-container">
          <q-toolbar-title> ENLAC </q-toolbar-title>
          <div class="q-toolbar__subtitle">
            Portal web para la administración y gestión
          </div>
        </div>
        <q-select
          dark
          dense
          outlined
          :options="[{ label: 'semanal' }]"
          class="text-grey-3"
          color="grey-3"
          v-model="span"
        >
          <template v-slot:prepend>
            <q-icon
              name="event"
              color="white"
            />
          </template>
        </q-select>
        <q-btn
          flat
          round
          icon="notifications"
        ></q-btn>
        <q-avatar
          rounded
          size="52px"
        >
          <q-img src="/avatar.png"></q-img>
        </q-avatar>

        <q-btn
          flat
          round
          color="white"
          icon="arrow_drop_down"
        >
          <q-menu :offset="[0, 15]">
            <q-list
              style="min-width: 255px"
              dense
            >
              <q-item
                clickable
                v-close-popup
              >
                <q-item-section avatar>
                  <q-icon name="notifications" />
                </q-item-section>
                <q-item-section>Notificaciones</q-item-section>
              </q-item>
              <q-expansion-item
                dense
                expand-separator
                icon="settings"
                label="Configuración"
              >
                <q-list
                  dense
                  style="padding-left: 22px"
                >
                  <q-item clickable>
                    <q-item-section>Administración de usuarios</q-item-section>
                  </q-item>
                  <q-item clickable>
                    <q-item-section>Catalogo de areas</q-item-section>
                  </q-item>
                  <q-item clickable>
                    <q-item-section>Catalogo de puestos</q-item-section>
                  </q-item>
                  <q-item clickable>
                    <q-item-section>Administracion de carrusel</q-item-section>
                  </q-item>
                </q-list>
              </q-expansion-item>
              <q-item
                clickable
                v-close-popup
              >
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section @click="authStore.attemptLogout()">Cerrar sesion</q-item-section>
              </q-item>
              <q-separator />
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <div style="padding: 32px">
        <q-breadcrumbs style="border: 1px solid grey">
          <q-breadcrumbs-el
            v-for="rt in route.matched"
            :key="rt.path"
            :label="rt.meta.label"
            :icon="rt.meta.icon"
            :to="rt.path ?? null"
          />
        </q-breadcrumbs>
      </div>
      <div style="padding: 15px 32px">
        <router-view style="border: 1px solid grey" />
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useAuthStore } from "src/stores/user-store";
import { ref } from "vue";
import { useRoute } from "vue-router";

const authStore = useAuthStore();
const route = useRoute();
const span = ref({ label: "semanal", value: "1" });
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

.q-item__section--side>.q-icon {
  font-size: 16px;
}

.q-item__section--main {
  font-size: 14px;
}
</style>

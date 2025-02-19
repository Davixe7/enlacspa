<script setup>
import { api } from "src/boot/axios";
import { onMounted, ref } from "vue";
const errors = ref({ email: "", password: "" });

const baseUrl = new URL(api.defaults.baseURL).origin
const loading = ref(false);
const email = ref('');
const password = ref('');
const remeberme = ref(false);

onMounted(() => csrfCookie())

async function csrfCookie() {
  await api.get(`${baseUrl}/sanctum/csrf-cookie`)
}

async function attemptLogin() {
  try {
    loading.value = true
    await api.post(`${baseUrl}/login`, { email: email.value, password: password.value })
  } catch (error) {
    console.log('withCredentials: ' + api.defaults.withCredentials)
    console.log('withXSRF: ' + api.defaults.withXSRFToken)
    console.log('Error al intentar loguear: ' + error)
  }
  loading.value = false
}

function putErrors() {
  errors.value.email = "Nombre de usuario o contrasenia incorrectos";
}
</script>

<template>
  <div class="row login-row">
    <div style="
        position: absolute;
        right: 0;
        bottom: 0;
        z-index: 50000;
        background: #000;
        display: block;
      ">
      <q-btn
        color="primary"
        round
        icon="error"
        @click="putErrors()"
      ></q-btn>
      <q-btn
        color="primary"
        round
        icon="delete"
        @click="errors = {}"
      ></q-btn>
      <q-btn
        color="primary"
        round
        icon="pin"
        @click="loading = !loading"
      ></q-btn>
    </div>
    <div class="col-12 col-md-6 flex items-center login-col-left">
      <div>
        <h1 class="title">ENLAC</h1>
        <div class="subtitle">Portal web para la administración y gestión</div>
        <div>
          <q-form
            class="q-gutter-y-lg"
            @submit.prevent="attemptLogin"
          >
            <q-input
              outlined
              stack-label
              label="Correo electrónico"
              type="email"
              v-model="email"
              hide-bottom-space
              :error="!!errors.email"
              :error-message="errors.email"
            ></q-input>
            <q-input
              outlined
              stack-label
              label="Contraseña"
              type="password"
              v-model="password"
              hide-bottom-space
              :error="!!errors.email"
              :error-message="errors.email"
            >
              <template v-slot:append="">
                <q-btn
                  flat
                  round
                  icon="remove_red_eye"
                  dense
                />
              </template>
            </q-input>
            <div class="flex justify-between items-center q-py-sm">
              <q-checkbox
                label="Recuérdame"
                v-model="remeberme"
                style="margin-left: -10px"
              ></q-checkbox>
              <a href="#">¿Olvidó su contraseña?</a>
            </div>
            <q-btn
              unelevated
              :loading="loading"
              color="primary"
              type="submit"
            >Iniciar sesión</q-btn>
          </q-form>
        </div>
      </div>
    </div>
    <div class="col-12 col-md-6 login-brand-column">
      <img
        src="./../assets/logo_white.png"
        alt=""
      />
    </div>
  </div>
</template>

<style>
.login-row {
  height: 100vh;
}

@media (min-width: 991px) {
  .login-col-left {
    padding-left: 100px;
  }
}

.login-brand-column {
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(rgb(1, 119, 193), rgba(0, 43, 106));
}

.title {
  color: #001f6d;
  font-size: 38px;
  font-weight: 700;
  line-height: 1.3rem;
  letter-spacing: 0;
}

.subtitle {
  font-size: 18px;
  font-weight: 500;
  line-height: 1.3rem;
  color: #111827;
  padding-bottom: 24px;
}

a {
  font-size: 14px;
  text-decoration: none;
  color: rgba(0, 31, 109, 1);
}

.q-checkbox__inner {
  width: 32px !important;
  min-width: 32px;
  height: 32px !important;
}
</style>

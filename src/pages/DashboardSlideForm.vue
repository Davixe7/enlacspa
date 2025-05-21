<script setup>
import 'vue-advanced-cropper/dist/style.css';
import { ref } from 'vue';
import { Cropper } from 'vue-advanced-cropper';
import { api } from 'src/boot/axios';
import notify from 'src/utils/notify';
import { useRouter } from 'vue-router';

const router = useRouter()
// Definimos el aspect ratio basado en las dimensiones deseadas
const slide = ref({ title: '' })
const canvasWidth = 1302;
const canvasHeight = 400;
const canvasAspect = canvasWidth / canvasHeight;

const imageInput = ref(null)
const image = ref(null);
const cropperRef = ref(null)

// Función para leer la imagen cargada
const onFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    image.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

function canvasToBlobAsync(canvas, type = 'image/jpeg', quality = 1) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

async function uploadImage() {
  const { canvas } = cropperRef.value.getResult();
  if (!canvas) return

  const data = new FormData();
  let blob = await canvasToBlobAsync(canvas)
  data.append('title', slide.value.title)
  data.append('picture', blob)

  try {
    await api.post('dashboard-slides', data)
    notify.positive('Diapositiva agregada con exito')
    router.push('/carrusel')
  }
  catch (error) {
    notify.negative('Error al agregar la diapositiva')
    console.log(error);
  }
}
</script>

<template>
  <div style="padding: 0 32px;">

    <div
      class="flex"
      style="align-items: center;"
    >
      <h1
        class="page-title"
        style="margin: 0; padding: 24px 0"
      >Anadir diapositiva</h1>

      <div class="q-ml-auto flex items-end">
        <q-input
          outlined
          placeholder="Titulo"
          v-model="slide.title"
          hide-bottom-space
          class="q-mr-sm"
        />
        <q-btn
          dense
          round
          icon="sym_o_replay"
          class="q-mr-sm"
          :disable="!image"
          :flat="!image"
        ></q-btn>
        <q-btn
          dense
          round
          icon="sym_o_close"
          class="q-mr-sm"
          :disable="!image"
          :flat="!image"
          @click="image = null"
        ></q-btn>
        <q-btn
          dense
          round
          :disable="!image"
          :flat="!image"
          icon="sym_o_upload"
          @click="uploadImage"
        ></q-btn>
      </div>
    </div>

    <div
      v-if="!image"
      class="add-picture-canvas"
    >
      <!-- Input para cargar imagen -->
      <input
        ref="imageInput"
        type="file"
        @change="onFileChange"
        accept="image/*"
        style="display: none"
      />

      <q-icon
        color="grey"
        size="128px"
        name="sym_o_add_photo_alternate"
      >
      </q-icon>

      <q-btn
        @click="imageInput.click()"
        color="primary"
        icon="add"
      >Agregar imagen
      </q-btn>
    </div>

    <div
      class="cropper-container"
      v-else
    >
      <!-- El cropper se muestra si hay imagen cargada -->
      <Cropper
        ref="cropperRef"
        :src="image"
        :stencil-props="{ aspectRatio: canvasAspect, movable: false, resizable: false }"
        :stencil-size="{ width: 1302, height: 400 }"
        :resize-image="{
          adjustStencil: false
        }"
        image-restriction="stencil"
        class="cropper"
      />
    </div>
  </div>
</template>

<style scoped>
.add-picture-canvas {
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: calc(100vh - 350px);
  border: 1px solid grey;
  border-radius: 5px;
}

.cropper-container {
  width: 100%;
  height: 400px;
  border: 1px solid #ccc;
  position: relative;
}

.cropper {
  width: 100%;
  height: 100%;
}
</style>

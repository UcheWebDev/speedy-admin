<template>
  <v-container class="pa-md-12 pa-6" fluid>
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <div class="mb-1 text-grey">Hotel Details Page</div>
        <h3 class="text-h5">
          {{ hotel ? hotel.hotel_name : "" }}
        </h3>
      </div>
      <v-btn color="primary" @click="openDialog" class="font-weight-bold">
        <v-icon left>mdi-plus</v-icon> Add
      </v-btn>
    </div>

    <v-row>
      <v-col
        v-for="item in items"
        :key="item"
        class="d-flex child-flex"
        cols="4"
      >
        <v-img
          :src="item.gallery_imgurl"
          aspect-ratio="1"
          cover
          @click="deleteItem(item.id)"
        >
          <template v-slot:placeholder>
            <v-row align="center" class="fill-height ma-0" justify="center">
              <v-progress-circular
                color="grey-lighten-5"
                indeterminate
              ></v-progress-circular>
            </v-row>
          </template>
        </v-img>
      </v-col>
    </v-row>

    <div
      class="centered-content"
      v-if="isLoadingRequest == false && !items.length"
    >
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">No data...</h1>
        <p>Gallery data cannot be found at the moment</p>
      </div>
    </div>

    <!-- Add Restaurant Modal -->
    <AddDataDialogue
      v-model="dialog"
      title="Add Restaurant"
      @close="handleClose"
    >
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-file-input
          class="mt-5"
          v-model="formData.image"
          label="Upload Hotel Gallery Photo"
          accept="image/*"
          @change="onFilePicked"
          :rules="imageRules"
        ></v-file-input>

        <!--submit btn-->
        <v-btn
          class="mt-2"
          color="primary darken-1"
          @click="saveImageToGallery"
          block
          :disabled="!valid || !formData.gallery_imageFile || isLoadingRequest"
        >
          Add To Gallery
        </v-btn>
      </v-form>
    </AddDataDialogue>
    <!--snackbar -->
    <v-snackbar v-model="snackbar.show" :timeout="snackbar.timeout">
      {{ snackbar.message }}
    </v-snackbar>

    <!--loading request overlay-->
    <v-overlay
      :model-value="isLoadingRequest"
      class="align-center justify-center"
    >
      <v-progress-circular
        color="primary"
        size="64"
        indeterminate
      ></v-progress-circular>
    </v-overlay>

    <!--prompt-->
    <v-dialog v-model="RequestDialog" persistent max-width="290">
      <v-card>
        <v-card-title class="text-button">
          {{ prompt }}
        </v-card-title>
        <v-card-text class="text-button"
          >Confirm to delete this item</v-card-text
        >
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="closeRequestDialogue">
            Disagree
          </v-btn>
          <v-btn color="green darken-1" text @click="confirmEvent">
            Confirm
            <template v-slot:loader>
              <span class="custom-loader">
                <v-icon light>mdi-cached</v-icon>
              </span>
            </template>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
/* eslint-disable */
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ErrorHandler } from "@/utils/ErrorHandler";
import { fetchHotelDetails } from "@/utils/httpRequests";
import AddDataDialogue from "@/components/AddDataDialogue.vue";
import { createFormData } from "@/utils/formData";
import {
  addImgeToHotelGallery,
  deleteGalleryPhoto,
} from "@/utils/httpRequests";

const isLoadingRequest = ref(true);

const route = useRoute();
const currentPath = computed(() => route.path);
const currentId = computed(() => route.params.id);

const dialog = ref(false);
const RequestDialog = ref(false);

const snackbar = reactive({
  show: false,
  message: "",
  timeout: 3000,
});

const router = useRouter();
const errorHandler = new ErrorHandler(snackbar, router);

const selectedDataId = ref(null);
const hotel = ref(null);
const items = ref([]);

const valid = ref(false);
const form = ref(null);

const formData = ref({
  id: null,
  gallery_imageFile: null,
});

const imageRules = [(value) => !!value || "Image is required."];

const closeRequestDialogue = () => {
  selectedDataId.value = null;
  RequestDialog.value = false;
};

const deleteItem = (id) => {
  selectedDataId.value = id;
  RequestDialog.value = true;
};

const openDialog = () => {
  resetForm();
  dialog.value = true;
};

const handleClose = () => {
  dialog.value = false;
  resetForm();
};

const resetForm = () => {
  formData.value = {
    id: null,
    gallery_imageFile: null,
  };
};

const fetchItems = async () => {
  try {
    const response = await fetchHotelDetails(currentPath.value);
    items.value = response.galleries;
    hotel.value = response;
    isLoadingRequest.value = false;
  } catch (error) {
    isLoadingRequest.value = false;
    errorHandler.handle(error);
  } finally {
    isLoadingRequest.value = false;
  }
};

const saveImageToGallery = async () => {
  isLoadingRequest.value = true;
  try {
    const payLoad = createFormData(formData.value);
    await addImgeToHotelGallery(currentId.value, payLoad);
    snackbar.message = "added successfully!";
    snackbar.show = true;
    fetchItems();
  } catch (error) {
    errorHandler.handle(error);
  } finally {
    isLoadingRequest.value = false;
  }
};

const confirmEvent = async () => {
  try {
    await deleteGalleryPhoto(selectedDataId.value);
    fetchItems();
    closeRequestDialogue();
  } catch (error) {
    snackbar.message = "Error deleting item!";
    snackbar.show = true;
  }
};

/* image validation */
const onFilePicked = (e) => {
  const files = e.target.files;
  if (files[0] !== undefined) {
    formData.value.hotel_image_name = files[0].name;
    if (formData.value.hotel_image_name.lastIndexOf(".") <= 0) {
      return;
    }
    const fr = new FileReader();
    fr.readAsDataURL(files[0]);
    fr.addEventListener("load", () => {
      formData.value.gallery_imageFile = files[0];
    });
  } else {
    formData.value.hotel_image_name = "";
    formData.value.gallery_imageFile = "";
  }
};

onMounted(() => {
  fetchItems();
});
</script>

<style scoped>
.centered-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh; /* Full viewport height */
  text-align: center;
}
</style>
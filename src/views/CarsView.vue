<template>
  <div class="about pa-3">
    <!-- Existing content -->
    <div class="d-flex align-center justify-space-between">
      <div>
        <div class="mb-3 text-grey">Cars</div>
        <h1 class="text-h4 text-red-darken-4">Cars Hire</h1>
      </div>
      <v-btn color="primary" @click="openDialog">
        <v-icon left>mdi-plus</v-icon> Add
      </v-btn>
    </div>

    <v-row class="mt-2" v-if="loading">
      <v-col cols="12" md="6" lg="4" sm="6" v-for="n in 4" :key="n">
        <v-skeleton-loader
          :loading="loading && !cars.length"
          type="image, list-item-two-line"
        >
        </v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row class="mt-2" v-if="!loading && cars.length">
      <v-col cols="12" md="6" lg="4" sm="6" v-for="car in cars" :key="car.id">
        <v-card class="mx-auto" max-width="400" flat>
          <v-img :src="car.car_img_url" height="200px" cover></v-img>
          <v-card-title>{{ car.car_name }}</v-card-title>
          <v-divider class="mx-4 mb-1 mt-3"></v-divider>

          <v-card-text>
            <p class="mb-1">Model : {{ car.model }}</p>
            <p class="mb-1">Price: &#8358; {{ car.price }}</p>
            <p class="mt-2">Extra Information:</p>
            <p>
              {{
                car && car.extra_information
                  ? car.extra_information
                  : "No information added"
              }}
            </p>
            <v-chip-group>
              <v-chip v-for="type in JSON.parse(car.features)" :key="type">{{
                type
              }}</v-chip>
            </v-chip-group>
            <p>Car Ratings</p>
            <v-rating
              :model-value="car.ratings"
              color="amber"
              density="compact"
              size="small"
              half-increments
              readonly
            ></v-rating>
            <v-card-actions>
              <v-btn
                color="primary darken-1"
                prepend-icon="mdi-pen"
                text="Edit"
                @click="openDialog(car)"
              ></v-btn>

              <v-btn
                color="primary darken-1"
                prepend-icon="mdi-delete"
                text="Delete"
                @click="deleteCarData(car.id)"
              ></v-btn>
            </v-card-actions>
          </v-card-text>

          <v-divider></v-divider>
        </v-card>
      </v-col>
    </v-row>

    <div class="centered-content" v-if="loading == false && !cars.length">
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">No data</h1>
        <p>cars data cannot be found at the moment</p>
      </div>
    </div>

    <!-- Add/Edit Event Modal -->
    <AddDataDialogue v-model="dialog" :title="dialogTitle" @close="handleClose">
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="saveCar"
      >
        <v-container>
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="car.car_name"
                :rules="[rules.required, rules.max255]"
                label="Car Name"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="car.model"
                :rules="[rules.required, rules.max255]"
                label="Model"
                required
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="car.ratings"
                :rules="[rules.ratings]"
                label="Ratings"
                type="number"
                step="0.1"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model="car.price"
                :rules="[rules.required, rules.numeric, rules.min0]"
                label="Price"
                type="number"
                min="0"
                required
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-textarea
                v-model="car.extra_information"
                :rules="[rules.string]"
                label="Extra Information"
              ></v-textarea>
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="car.features"
                :items="featuresOptions"
                :prepend-icon="extraField ? 'mdi-minus' : 'mdi-plus'"
                @click:prepend="addExtraInformation"
                :rules="[rules.array]"
                label="Features"
                multiple
              ></v-select>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="12">
              <v-file-input
                v-model="car.image"
                label="Car Image"
                accept="image/*"
                @change="onFilePicked"
              ></v-file-input>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="12" v-if="extraField">
              <v-text-field
                label="Add extra car features"
                v-model="extraFeatures"
                append-icon="mdi-send-variant-outline"
                @click:append="addToSelections"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
        <v-btn
          class="mt-2"
          color="primary darken-1"
          @click="saveCar"
          :disabled="!valid || isLoadingRequest"
        >
          {{ dialogButton }}
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
        <v-card-text class="text-button">Confirm to delete</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="green darken-1" text @click="closeRequestDialogue">
            Disagree
          </v-btn>
          <v-btn color="green darken-1" text @click="confirmDeleteEvent">
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
  </div>
</template>
  
  <script setup>
/* eslint-disable */
import { ref, reactive, onMounted } from "vue";
import { ErrorHandler } from "@/utils/ErrorHandler";
import { useRouter } from "vue-router";
import { createFormData } from "@/utils/formData";
import {
  fetchCars,
  saveCarToServer,
  editCarDataHttpRequest,
  deleteCarDataHttpRequest,
} from "@/utils/httpRequests";
import AddDataDialogue from "@/components/AddDataDialogue.vue";
import { formatEventDate } from "@/utils/dateFormatter";

const dialog = ref(false);
const RequestDialog = ref(false);

const valid = ref(false);
const loading = ref(true);
const isLoadingRequest = ref(false);
const selectedDataId = ref(null);
const extraFeatures = ref(null);
const extraField = ref(false);

const isEditMode = ref(false);
const dialogTitle = ref("Add Event");
const dialogButton = ref("Save");
const featuresOptions = ref([
  "Air Conditioning",
  "Leather Seats",
  "Sunroof",
  "Bluetooth",
]);

const snackbar = reactive({
  show: false,
  message: "",
  timeout: 3000,
});

const car = ref({
  id: null,
  car_name: "",
  model: "",
  ratings: null,
  price: null,
  extra_information: "",
  features: [],
  carFilename: null,
  car_imageFile: null,
});

const resetForm = () => {
  car.value = {
    id: null,
    car_name: "",
    model: "",
    ratings: null,
    price: null,
    extra_information: "",
    features: [],
    carFilename: null,
    car_imageFile: null,
  };
};

const rules = {
  required: (value) => !!value || "Required.",
  max255: (value) => (value && value.length <= 255) || "Max 255 characters.",
  numeric: (value) => !isNaN(value) || "Must be a number.",
  min0: (value) => value >= 0 || "Must be at least 0.",
  ratings: (value) =>
    value === null ||
    (value >= 0 && value <= 5) ||
    "Ratings must be between 0 and 5.",
  string: (value) => typeof value === "string" || "Must be a string.",
  array: (value) => Array.isArray(value) || "Must be an array.",
};

const handleClose = () => {
  dialog.value = false;
  resetForm();
};

const addExtraInformation = () => {
  extraField.value = !extraField.value;
};

const addToSelections = () => {
  featuresOptions.value.push(extraFeatures.value);
  extraFeatures.value = "";
  snackbar.message = "Extra Field added !";
  snackbar.show = true;
};

const openDialog = (cars = null) => {
  if (cars && cars.car_name) {
    isEditMode.value = true;
    dialogTitle.value = "Edit Car";
    dialogButton.value = "Update";
    car.value.id = cars.id;
    car.value.car_name = cars.car_name;
    car.value.model = cars.model;
    car.value.ratings = cars.ratings;
    car.value.price = cars.price;
    car.value.car_imageFile = null;
    car.value.extra_information = cars.extra_information;
    car.value.features = JSON.parse(cars.features);
  } else {
    isEditMode.value = false;
    dialogTitle.value = "Add Car";
    dialogButton.value = "Save";
    resetForm();
  }
  dialog.value = true;
};

const deleteCarData = (id) => {
  selectedDataId.value = id;
  RequestDialog.value = true;
};

const closeRequestDialogue = () => {
  selectedDataId.value = null;
  RequestDialog.value = false;
};

const router = useRouter();
const errorHandler = new ErrorHandler(snackbar, router);

const cars = ref([]);

const fetchCarsData = async () => {
  loading.value = true;
  try {
    cars.value = await fetchCars();
  } catch (error) {
    errorHandler.handle(error);
  } finally {
    loading.value = false;
  }
};

const saveCar = async () => {
  isLoadingRequest.value = true;
  try {
    const payLoad = createFormData(car.value);
    if (car.value.id) {
      await editCarDataHttpRequest(car.value.id, payLoad);
      snackbar.message = "Updated successfully!";
    } else {
      await saveCarToServer(payLoad);
      snackbar.message = "Added successfully!";
    }
    fetchCarsData();
    snackbar.show = true;
    handleClose();
  } catch (error) {
    errorHandler.handle(error);
  } finally {
    isLoadingRequest.value = false;
  }
};

const confirmDeleteEvent = async () => {
  isLoadingRequest.value = true;
  try {
    await deleteCarDataHttpRequest(selectedDataId.value);
    fetchCarsData();
    isLoadingRequest.value = false;
    closeRequestDialogue();
  } catch (error) {
    isLoadingRequest.value = false;
    snackbar.message = "Error deleting data!";
    snackbar.show = true;
  }
};

/* image validation */
const onFilePicked = (e) => {
  const files = e.target.files;
  if (files[0] !== undefined) {
    car.value.carFilename = files[0].name;
    if (car.value.carFilename.lastIndexOf(".") <= 0) {
      return;
    }
    const fr = new FileReader();
    fr.readAsDataURL(files[0]);
    fr.addEventListener("load", () => {
      car.value.car_imageFile = files[0];
    });
  } else {
    car.value.car_imageFile = "";
    car.value.carFilename = "";
  }
};

onMounted(() => {
  fetchCarsData();
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
  
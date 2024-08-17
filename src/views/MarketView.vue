<template>
  <div class="about pa-3">
    <div class="d-flex align-center justify-space-between">
      <div>
        <div class="mb-3 text-grey">Supermarket</div>
        <h1 class="text-h4 text-red-darken-4">Supermarket</h1>
      </div>
      <v-btn color="primary" class="font-weight-bold" @click="openDialog">
        <v-icon left>mdi-plus</v-icon> Add
      </v-btn>
    </div>
    <v-row class="mt-2" v-if="loading">
      <v-col cols="12" md="6" lg="4" sm="6" v-for="n in 4" :key="n">
        <v-skeleton-loader
          :loading="loading && !supermarkets.length"
          type="image, list-item-two-line"
        >
        </v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-if="!loading && supermarkets.length" class="mt-2">
      <v-col
        cols="12"
        md="6"
        lg="4"
        sm="6"
        v-for="market in supermarkets"
        :key="market.id"
      >
        <DataCard
          :data="market"
          :selection="selection"
          @editItem="editRestuarantDetails"
          @deleteItem="deletemarketData"
          @viewItem="viewItemById"
        />
      </v-col>
    </v-row>

    <div
      class="centered-content"
      v-if="loading == false && !supermarkets.length"
    >
      <div>
        <!-- <div class="text-h4">&#9785;</div> -->
        <h1 class="text-h4 font-weight-bold mb-1">No data</h1>
        <p>market data cannot be found at the moment</p>
      </div>
    </div>

    <!-- Add Restaurant Modal -->
    <AddDataDialogue v-model="dialog" title="Add market" @close="handleClose">
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="savemarket"
      >
        <v-file-input
          v-model="formData.market_imageFile"
          label="Upload Resturant Photo"
          accept="image/jpeg, image/jpg, image/png"
          prepend-icon="mdi-camera"
          outlined
          @change="onFilePicked"
          required
        ></v-file-input>

        <v-text-field
          v-model="formData.market_name"
          label="market Name"
          :rules="nameRules"
        ></v-text-field>

        <v-text-field
          label="Type a market name or address"
          ref="autocompleteInput"
          @input="onInput"
          v-model="formData.market_location"
          :rules="locationRules"
          clearable
          @click:clear="onClearLocationField"
        ></v-text-field>

        <v-list v-if="suggestions.length">
          <v-list-item
            v-for="suggestion in suggestions"
            :key="suggestion.place_id"
            @click="selectSuggestion(suggestion)"
          >
            <v-list-item-content>
              <v-list-item-title>{{
                suggestion.description
              }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-switch
          class="mb-2"
          color="primary"
          v-model="liveLocationSwitch"
          label="Use live location filter"
          hide-details
          inset
        ></v-switch>

        <v-text-field
          v-model="formData.phone_number"
          label="Phone Number"
          :rules="phoneRules"
          required
        ></v-text-field>
        <!--submit btn-->
        <v-btn
          class="mt-2"
          color="primary darken-1"
          @click="savemarketData"
          :disabled="!valid || isLoadingRequest"
        >
          Save
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
  </div>
</template>
    
    <script setup>
/*eslint-disable*/
import { ref, onMounted, reactive } from "vue";
import { Loader } from "@googlemaps/js-api-loader";
import { ErrorHandler } from "@/utils/ErrorHandler";
import { useRouter } from "vue-router";

import {
  fetchmarket,
  savemarket,
  deletemarket,
  updatemarketRequest,
} from "@/utils/httpRequests";

import DataCard from "@/components/DataCard.vue";
import AddDataDialogue from "@/components/AddDataDialogue.vue";
import { createFormData } from "@/utils/formData";

const query = ref("");
const suggestions = ref([]);
const autocompleteService = ref(null);
const placesService = ref(null);

const router = useRouter();

const snackbar = reactive({
  show: false,
  message: "",
  timeout: 3000,
});

const loader = new Loader({
  apiKey: "AIzaSyAZCwA6pT2PGwbn1iauPEV92kuxY8BuUd0",
  version: "weekly",
});

const errorHandler = new ErrorHandler(snackbar, router);

const loading = ref(true);
const isLoadingRequest = ref(false);
const selection = ref(1);
const supermarkets = ref([]);

const dialog = ref(false);
const UpdateDialog = ref(false);
const RequestDialog = ref(false);

const valid = ref(false);
const form = ref(null);
const liveLocationSwitch = ref(false);
const isEditMode = ref(false);
const selectedDataId = ref(null);

const formData = ref({
  market_name: "",
  market_location: "",
  phone_number: "",
  market_image_name: null,
  market_imageFile: null,
  place_id: "",
  latitude: null,
  longitude: null,
  market_ratings: 0,
});

const nameRules = [
  (v) => !!v || "supermarket name is required",
  (v) => v.length <= 255 || "Name must be less than 255 characters",
];

const locationRules = [(v) => !!v || "Location is required"];

const phoneRules = [(v) => !!v || "Phone number is required"];

const openRequestDialogue = () => {
  RequestDialog.value = true;
};

const viewItemById = (itemId) => {
  router.push({ name: "marketItemPage", params: { id: itemId } });
  // router.push(`/pharmacy/${id}`);
};

const closeRequestDialogue = () => {
  selectedDataId.value = null;
  RequestDialog.value = false;
};

const openDialog = () => {
  resetForm();
  dialog.value = true;
};

const handleClose = () => {
  dialog.value = false;
  UpdateDialog.value = false;
  resetForm();
};

const resetForm = () => {
  formData.value = {
    market_name: "",
    market_location: "",
    phone_number: "",
    market_image_name: null,
    market_imageFile: null,
    place_id: "",
    latitude: null,
    longitude: null,
    market_ratings: 0,
  };
};

const onClearLocationField = () => {
  formData.value.market_location = "";
  suggestions.value = [];
};

const fetchmarketData = async () => {
  loading.value = true;
  try {
    supermarkets.value = await fetchmarket();
  } catch (error) {
    errorHandler.handle(error);
  } finally {
    loading.value = false;
  }
};

const savemarketData = async () => {
  isLoadingRequest.value = true;
  try {
    const payLoad = createFormData(formData.value);
    if (formData.value.id) {
      await updatemarketRequest(formData.value.id, payLoad);
      snackbar.message = "Updated successfully!";
    } else {
      await savemarket(payLoad);
      snackbar.message = "Added successfully!";
    }
    snackbar.show = true;
    fetchmarketData();
  } catch (error) {
    errorHandler.handle(error);
  } finally {
    isLoadingRequest.value = false;
  }
};

const confirmEvent = async () => {
  try {
    await deletemarket(selectedDataId.value);
    fetchmarketData();
    closeRequestDialogue();
  } catch (error) {
    errorHandler.handle(error);
  }
};

const deletemarketData = (id) => {
  selectedDataId.value = id;
  openRequestDialogue();
};

const editRestuarantDetails = (data) => {
  if (data && data.name) {
    isEditMode.value = true;
    formData.value.id = data.id;
    formData.value.market_name = data.name;
    formData.value.market_imageFile = null;
    formData.value.market_location = data.location;
    formData.value.phone_number = data.phone;
    formData.value.place_id = data.place_id;
    formData.value.latitude = data.latitude;
    formData.value.longitude = data.longitude;
    formData.value.market_ratings = data.rating;
  } else {
    isEditMode.value = false;
    resetForm();
  }
  dialog.value = true;
};

/* map functions */
const initAutocompleteService = (placesModule) => {
  autocompleteService.value = new placesModule.AutocompleteService();
  placesService.value = new placesModule.PlacesService(
    document.createElement("div")
  );
};

const onInput = (e) => {
  console.log(e.target.value);
  const location = e.target.value;
  if (location.length > 2 && liveLocationSwitch.value) {
    autocompleteService.value.getPlacePredictions(
      {
        input: location,
        componentRestrictions: { country: "NG" },
      },
      (predictions, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          suggestions.value = predictions;
        } else {
          suggestions.value = [];
        }
      }
    );
  } else {
    suggestions.value = [];
  }
};

const selectSuggestion = (suggestion) => {
  formData.value.market_location = suggestion.description;
  suggestions.value = [];
  placesService.value.getDetails(
    { placeId: suggestion.place_id },
    (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        formData.value.market_name = place ? place.name : "";
        formData.value.phone_number = place ? place.formatted_phone_number : "";
        formData.value.market_location = place ? place.formatted_address : "";

        formData.value.place_id = place ? place.place_id : "";
        formData.value.market_ratings =
          place && place.rating !== undefined ? place.rating : 0;
        const location = place.geometry?.location;
        if (location) {
          formData.value.latitude = location.lat();
          formData.value.longitude = location.lng();
        } else {
          console.error("Geometry data is not available.");
        }
      }
    }
  );
};

/* image validation */
const onFilePicked = (e) => {
  const files = e.target.files;
  if (files[0] !== undefined) {
    formData.value.market_image_name = files[0].name;
    if (formData.value.market_image_name.lastIndexOf(".") <= 0) {
      return;
    }
    const fr = new FileReader();
    fr.readAsDataURL(files[0]);
    fr.addEventListener("load", () => {
      formData.value.market_imageFile = files[0];
      console.log(formData.value.market_imageFile);
    });
  } else {
    formData.value.market_image_name = "";
    formData.value.market_imageFile = "";
  }
};

onMounted(() => {
  loader
    .importLibrary("places")
    .then(initAutocompleteService)
    .catch((e) => console.error("Error loading Google Maps libraries:", e));
  fetchmarketData();
});
</script>
    
    <style scoped>
/* Add some basic styling */
.v-list {
  border: 1px solid #ccc;
  max-height: 200px;
  overflow-y: auto;
}

.v-list-item {
  cursor: pointer;
}

.v-list-item:hover {
  background-color: #eee;
}

.centered-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh; /* Full viewport height */
  text-align: center;
}
</style>
    
    
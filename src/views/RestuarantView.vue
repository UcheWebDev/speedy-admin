<template>
  <div class="about pa-3">
    <div class="d-flex align-center justify-space-between">
      <div>
        <div class="mb-3 text-grey">Restaurants</div>
        <h1 class="text-h4 text-red-darken-4">Restaurants</h1>
      </div>
      <v-btn color="primary" @click="openDialog" class="font-weight-bold">
        <v-icon left>mdi-plus</v-icon> Add
      </v-btn>
    </div>

    <v-row class="mt-2" v-if="loading">
      <v-col cols="12" md="6" lg="4" sm="6" v-for="n in 4" :key="n">
        <v-skeleton-loader
          :loading="loading && !restaurants.length"
          type="image, list-item-two-line"
        >
        </v-skeleton-loader>
      </v-col>
    </v-row>

    <v-row v-if="!loading && restaurants.length" class="mt-2">
      <v-col
        cols="12"
        md="6"
        lg="4"
        sm="6"
        v-for="restaurant in restaurants"
        :key="restaurant.id"
      >
        <DataCard
          :dataType="'restuarant'"
          :data="restaurant"
          :selection="selection"
          @editItem="editRestuarantDetails"
          @deleteItem="deleteRestaurantData"
          @addFoodRestuarant="addFoodItemRestuarant"
          @viewItem="viewItemById"
        />
      </v-col>
    </v-row>

    <div
      class="centered-content"
      v-if="loading == false && !restaurants.length"
    >
      <div>
        <h1 class="text-h4 font-weight-bold mb-1">No data</h1>
        <p>Restaurant data cannot be found at the moment</p>
      </div>
    </div>

    <!-- Add Restaurant Modal -->
    <AddDataDialogue
      v-model="dialog"
      title="Add Restaurant"
      @close="handleClose"
    >
      <v-form
        ref="form"
        v-model="valid"
        lazy-validation
        @submit.prevent="saveRestaurant"
      >
        <v-file-input
          v-model="formData.restuarant_image"
          label="Upload Resturant Photo"
          accept="image/jpeg, image/jpg, image/png"
          prepend-icon="mdi-camera"
          outlined
          @change="onFilePicked"
          required
        ></v-file-input>

        <v-text-field
          v-model="formData.restaurant_name"
          label="Restaurant Name"
          :rules="nameRules"
        ></v-text-field>

        <v-text-field
          label="Type a restuarant name or address"
          ref="autocompleteInput"
          @input="onInput"
          v-model="formData.restaurant_location"
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
          @click="saveRestaurantData"
          :disabled="!valid || isLoadingRequest"
        >
          Save
        </v-btn>
      </v-form>
    </AddDataDialogue>

    <!--add food to restuarant-->
    <AddDataDialogue v-model="addFoodDialogue" @close="handleFoodDialogueClose">
      <v-form ref="form" v-model="valid" lazy-validation>
        <v-file-input
          v-model="formData.restuarant_image"
          label="Food Image"
          accept="image/jpeg, image/jpg, image/png"
          prepend-icon="mdi-camera"
          outlined
          @change="onFoodImgFilePicked"
          required
        ></v-file-input>
        <v-select
          v-model="food.food_type"
          :items="foodTypes"
          :prepend-icon="extraField ? 'mdi-minus' : 'mdi-plus'"
          @click:prepend="addExtraInformation"
          label="Food Type"
          required
        ></v-select>

        <v-text-field
          v-if="extraField"
          label="Add extra food type"
          v-model="extraFoods"
          append-icon="mdi-send-variant-outline"
          @click:append="addToSelections"
        ></v-text-field>

        <v-text-field
          v-model="food.food_name"
          :rules="[
            (v) => !!v || 'Food Name is required',
            (v) =>
              v.length <= 255 || 'Food Name must be less than 255 characters',
          ]"
          label="Food Name"
          required
        ></v-text-field>

        <v-text-field
          v-model="food.food_price"
          :rules="[
            (v) => !!v || 'Food Price is required',
            (v) =>
              (!isNaN(parseFloat(v)) && v >= 0) ||
              'Food Price must be a positive number',
          ]"
          label="Food Price"
          required
        ></v-text-field>

        <v-textarea
          v-model="food.extra_information"
          :rules="[
            (v) =>
              v === null ||
              v === '' ||
              v.length <= 255 ||
              'Extra Information must be less than 255 characters',
          ]"
          label="Extra Information"
        ></v-textarea>

        <v-btn :disabled="!valid" color="success" @click="addFoodHttpRequest">
          Add Food
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
  fetchRestaurants,
  saveRestaurant,
  deleteRestaurant,
  updateRestuarantHttpRequest,
  saveFood,
} from "@/utils/httpRequests";
import DataCard from "@/components/DataCard.vue";
import AddDataDialogue from "@/components/AddDataDialogue.vue";
import { foodTypes } from "@/utils/globals";
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
const restaurants = ref([]);
const extraFoods = ref(null);
const extraField = ref(false);

const dialog = ref(false);
const UpdateDialog = ref(false);
const RequestDialog = ref(false);
const addFoodDialogue = ref(false);

const valid = ref(false);
const form = ref(null);
const isEditMode = ref(false);
// const valid = ref(false);
// const form = ref(null);

const liveLocationSwitch = ref(false);

const selectedDataId = ref(null);

const formData = ref({
  restaurant_name: "",
  restaurant_location: "",
  phone_number: "",
  restuarant_image_name: null,
  restuarant_imageFile: null,
  place_id: "",
  latitude: null,
  longitude: null,
  restaurant_ratings: 0,
});

const food = ref({
  restaurant_id: "",
  food_type: "select",
  food_name: "",
  food_price: "",
  extra_information: "",
  food_img_name: null,
  food_img_file: null,
});

const nameRules = [
  (v) => !!v || "Restaurant name is required",
  (v) => v.length <= 255 || "Name must be less than 255 characters",
];

const locationRules = [(v) => !!v || "Location is required"];

const phoneRules = [(v) => !!v || "Phone number is required"];

const openRequestDialogue = () => {
  RequestDialog.value = true;
};

const addExtraInformation = () => {
  extraField.value = !extraField.value;
};

const addToSelections = () => {
  foodTypes.value.push(extraFoods.value);
  extraFoods.value = "";
  snackbar.message = "Extra Field added !";
  snackbar.show = true;
};

const closeRequestDialogue = () => {
  selectedDataId.value = null;
  RequestDialog.value = false;
};

const handleFoodDialogueClose = () => {
  resetAddFoodDialogueForm();
  addFoodDialogue.value = false;
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
    restaurant_name: "",
    restaurant_location: "",
    phone_number: "",
    restuarant_image_name: null,
    restuarant_imageFile: null,
    place_id: "",
    latitude: null,
    longitude: null,
    restaurant_ratings: 0,
  };
};

const resetAddFoodDialogueForm = () => {
  food.value = {
    restaurant_id: "",
    food_type: "",
    food_name: "",
    food_price: "",
    extra_information: "",
    food_img_name: null,
    food_img_file: null,
  };
};

const onClearLocationField = () => {
  formData.value.restaurant_location = "";
  suggestions.value = [];
};

const fetchRestaurantsData = async () => {
  loading.value = true;
  try {
    restaurants.value = await fetchRestaurants();
  } catch (error) {
    errorHandler.handle(error);
  } finally {
    loading.value = false;
  }
};

const addFoodItemRestuarant = (restaurantId) => {
  food.value.restaurant_id = restaurantId;
  addFoodDialogue.value = true;
};

const saveRestaurantData = async () => {
  isLoadingRequest.value = true;
  try {
    const payLoad = createFormData(formData.value);
    if (formData.value.id) {
      await updateRestuarantHttpRequest(formData.value.id, payLoad);
      snackbar.message = "Updated successfully!";
    } else {
      await saveRestaurant(payLoad);
      snackbar.message = "Added successfully!";
    }
    snackbar.show = true;
    fetchRestaurantsData();
  } catch (error) {
    errorHandler.handle(error);
  } finally {
    isLoadingRequest.value = false;
  }
};

const addFoodHttpRequest = async () => {
  isLoadingRequest.value = true;
  try {
    const fd = new FormData();
    for (const key in food.value) {
      if (food.value[key] !== undefined) {
        fd.append(key, food.value[key]);
      } else {
        console.log("invalid keys");
      }
    }
    await saveFood(fd);
    snackbar.message = "Added successfully!";
    snackbar.show = true;
  } catch (error) {
    errorHandler.handle(error);
  } finally {
    isLoadingRequest.value = false;
  }
};

const confirmEvent = async () => {
  try {
    await deleteRestaurant(selectedDataId.value);
    fetchRestaurantsData();
    closeRequestDialogue();
  } catch (error) {
    snackbar.message = "Error deleting restaurant!";
    snackbar.show = true;
  }
};

const deleteRestaurantData = (id) => {
  selectedDataId.value = id;
  openRequestDialogue();
};

const editRestuarantDetails = (data) => {
  if (data && data.name) {
    isEditMode.value = true;
    formData.value.id = data.id;
    formData.value.restaurant_name = data.name;
    formData.value.restuarant_imageFile = null;
    formData.value.restuarant_image_name = null;
    formData.value.restaurant_location = data.location;
    formData.value.phone_number = data.phone;
    formData.value.place_id = data.place_id;
    formData.value.latitude = data.latitude;
    formData.value.longitude = data.longitude;
    formData.value.restaurant_ratings = data.rating;
  } else {
    isEditMode.value = false;
    resetForm();
  }
  dialog.value = true;
};

const viewItemById = (itemId) => {
  router.push({ name: "RestuarantFoodItemPage", params: { id: itemId } });
};

/* map functions */
const initAutocompleteService = (placesModule) => {
  autocompleteService.value = new placesModule.AutocompleteService();
  placesService.value = new placesModule.PlacesService(
    document.createElement("div")
  );
};

const onInput = (e) => {
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
  formData.value.restaurant_location = suggestion.description;
  suggestions.value = [];
  placesService.value.getDetails(
    { placeId: suggestion.place_id },
    (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        console.log(place);
        formData.value.restaurant_name = place ? place.name : "";
        formData.value.phone_number = place ? place.formatted_phone_number : "";
        formData.value.restaurant_location = place
          ? place.formatted_address
          : "";

        formData.value.place_id = place ? place.place_id : "";
        formData.value.restaurant_ratings =
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
    formData.value.restuarant_image_name = files[0].name;
    if (formData.value.restuarant_image_name.lastIndexOf(".") <= 0) {
      return;
    }
    const fr = new FileReader();
    fr.readAsDataURL(files[0]);
    fr.addEventListener("load", () => {
      formData.value.restuarant_imageFile = files[0];
      console.log(formData.value.restuarant_imageFile);
    });
  } else {
    formData.value.restuarant_image_name = "";
    formData.value.restuarant_imageFile = "";
  }
};

/* food image validation */
const onFoodImgFilePicked = (e) => {
  const files = e.target.files;
  if (files[0] !== undefined) {
    food.value.food_img_name = files[0].name;
    if (food.value.food_img_name.lastIndexOf(".") <= 0) {
      return;
    }
    const fr = new FileReader();
    fr.readAsDataURL(files[0]);
    fr.addEventListener("load", () => {
      food.value.food_img_file = files[0];
      console.log(food.value.food_img_file);
    });
  } else {
    food.value.food_img_name = "";
    food.value.food_img_file = "";
  }
};

onMounted(() => {
  loader
    .importLibrary("places")
    .then(initAutocompleteService)
    .catch((e) => console.error("Error loading Google Maps libraries:", e));
  fetchRestaurantsData();
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


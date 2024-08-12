<!-- components/RestaurantCard.vue -->
<template>
  <v-hover v-slot="{ isHovering, props }">
    <v-card
      :class="{ 'on-hover': isHovering }"
      :elevation="isHovering ? 16 : 0"
      :disabled="loading"
      :loading="loading"
      class="mx-auto"
      max-width="374"
      flat
      v-bind="props"
    >
      <v-img height="250" :src="data.img_url" cover></v-img>

      <v-card-item>
        <v-card-title>{{ data.name }}</v-card-title>

        <v-card-subtitle>
          <span class="me-1">{{ data.location }}</span>
          <v-icon color="error" icon="mdi-fire-circle" size="small"></v-icon>
        </v-card-subtitle>
      </v-card-item>

      <v-card-text>
        <v-row align="center" class="mx-0">
          <v-rating
            :model-value="rating"
            color="amber"
            density="compact"
            size="small"
            half-increments
            readonly
          ></v-rating>

          <div class="text-grey ms-4">{{ rating }} ({{ reviews }}) Likes</div>
        </v-row>

        <!-- <v-divider class="mx-4 mb-1 mt-4"></v-divider> -->

        <div class="my-4 text-subtitle-1 mt-6"></div>

        <div>
          Address: {{ data.location }} <br />
          Phone: {{ data.phone }}
        </div>
      </v-card-text>

      <!-- <v-card-title>Tonight's availability</v-card-title>

    <div class="px-4 mb-2">
      <v-chip-group
        v-model="selection"
        selected-class="bg-deep-purple-lighten-2"
      >
        <v-chip>5:30PM</v-chip>
        <v-chip>7:30PM</v-chip>
        <v-chip>8:00PM</v-chip>
        <v-chip>9:00PM</v-chip>
      </v-chip-group>
    </div> -->

      <div class="pa-3">
        <v-btn
          color="blue-darken-4"
          prepend-icon="mdi-pen"
          text="Edit"
          slim
          @click="reserve"
          size=""
          class="mr-2"
        ></v-btn>
        <v-btn
          color="red-darken-4"
          prepend-icon="mdi-delete"
          text="Delete"
          slim
          class="mr-2"
          size=""
          @click="deleteRestuarant"
        ></v-btn>
        <v-btn
          v-if="dataType !== 'hotel'"
          color="green"
          prepend-icon="mdi-eye"
          text="View"
          slim
          class="mr-2"
          size=""
          @click="viewItem"
        ></v-btn>
        <v-btn
          v-if="dataType == 'restuarant'"
          color="primary"
          prepend-icon="mdi-plus"
          text="Add Food"
          slim
          class="mr-2 mt-2"
          size=""
          @click="addItemRestuarant"
        ></v-btn>
      </div>
    </v-card>
  </v-hover>
</template>
  
  <script setup>
import { ref, defineProps, defineEmits } from "vue";

const props = defineProps({
  data: Object,
  loading: Boolean,
  dataType: String,
});

const emit = defineEmits(["editItem", "deleteItem"]);

const rating = ref(props.data.ratings);
const reviews = ref(props.data.likes);

const reserve = () => {
  emit("editItem", props.data);
};

const deleteRestuarant = () => {
  emit("deleteItem", props.data.id);
};

const viewItem = () => {
  emit("viewItem", props.data.id);
};

const addItemRestuarant = () => {
  emit("addFoodRestuarant", props.data.id);
};
</script>
  

<style  scoped>
.v-card.on-hover.v-theme--dark {
  background-color: rgba(#fff, 0.8);
}

.v-card__text {
  color: #000;
}
</style>
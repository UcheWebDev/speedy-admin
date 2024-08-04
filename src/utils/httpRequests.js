import axios from "@/utils/axiosConfig";

export const fetchRestaurants = async () => {
    try {
        const response = await axios.get("/admin/restuarants");
        return response.data.data;
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        throw error;
    }
};

export const saveRestaurant = async (restaurant) => {
    try {
        await axios.post("/admin/AddNewResturant", restaurant);
    } catch (error) {
        console.error("Error saving restaurant:", error);
        throw error;
    }
};

export const deleteRestaurant = async (id) => {
    try {
        await axios.delete(`/admin/restaurants/${id}`);
    } catch (error) {
        console.error("Error deleting restaurant:", error);
        throw error;
    }
};

export const updateRestuarantHttpRequest = async (data) => {
    try {
        await axios.put(`/admin/restaurants/${data.id}`, data);
    } catch (error) {
        console.error("Error deleting restaurant:", error);
        throw error;
    }
}


export const fetchPharmacy = async () => {
    try {
        const response = await axios.get("/admin/pharmacies");
        return response.data.data;
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        throw error;
    }
};

export const savepharmacy = async (data) => {
    try {
        await axios.post("/admin/pharmacies", data);
    } catch (error) {
        console.error("Error saving restaurant:", error);
        throw error;
    }
};

export const deletePharmacy = async (id) => {
    try {
        await axios.delete(`/admin/pharmacies/${id}`);
    } catch (error) {
        console.error("Error deleting pharamacy:", error);
        throw error;
    }
};

export const updatePharmacyRequest = async (data) => {
    try {
        await axios.put(`/admin/pharmacies/${data.id}`, data);
    } catch (error) {
        console.error("Error deleting restaurant:", error);
        throw error;
    }
}


export const fetchmarket = async () => {
    try {
        const response = await axios.get("/admin/supermarkets");
        return response.data.data;
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        throw error;
    }
};

export const savemarket = async (data) => {
    try {
        await axios.post("/admin/supermarkets", data);
    } catch (error) {
        console.error("Error saving restaurant:", error);
        throw error;
    }
};

export const deletemarket = async (id) => {
    try {
        await axios.delete(`/admin/supermarkets/${id}`);
    } catch (error) {
        console.error("Error deleting pharamacy:", error);
        throw error;
    }
};

export const updatemarketRequest = async (data) => {
    try {
        await axios.put(`/admin/supermarkets/${data.id}`, data);
    } catch (error) {
        console.error("Error deleting restaurant:", error);
        throw error;
    }
}

export const fetchEvents = async () => {
    try {
        const response = await axios.get("/admin/events");
        return response.data.data;
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        throw error;
    }
}

export const saveNewEvent = async (data) => {
    try {
        await axios.post("/admin/event-tickets", data);
    } catch (error) {
        console.error("Error saving restaurant:", error);
        throw error;
    }
}

export const deleteEventDataHttpRequest = async (id) => {
    try {
        await axios.delete(`/admin/event-tickets/${id}`);
    } catch (error) {
        console.error("Error deleting event:", error);
        throw error;
    }
}

export const editEventDataHttpRequest = async (id, data) => {
    try {
        await axios.put(`/admin/event-tickets/${id}`, data);
    } catch (error) {
        console.error("Error updating event:", error);
        throw error;
    }
}


export const fetchCars = async () => {
    try {
        const response = await axios.get("/admin/cars");
        return response.data.data;
    } catch (error) {
        console.error("Error fetching cars:", error);
        throw error;
    }
}

export const saveCarToServer = async (data) => {
    try {
        await axios.post("/admin/createNewCarCollection", data);
    } catch (error) {
        console.error("Error saving car:", error);
        throw error;
    }
}
export const editCarDataHttpRequest = async (id, data) => {
    try {
        await axios.put(`/admin/cars/${id}`, data);
    } catch (error) {
        console.error("Error updating event:", error);
        throw error;
    }
}

export const deleteCarDataHttpRequest = async (id) => {
    try {
        await axios.delete(`/admin/cars/${id}`);
    } catch (error) {
        console.error("Error deleting car:", error);
        throw error;
    }
}

export const fetchRidersHttpRequest = async () => {
    try {
        const response = await axios.get("/admin/riders");
        return response.data.data;
    } catch (error) {
        console.error("Error fetching riders:", error);
        throw error;
    }
}

export const saveRiderHttoRequest = async (data) => {
    try {
        await axios.post("/admin/riders", data);
    } catch (error) {
        console.error("Error saving rider:", error);
        throw error;
    }
}

export const editRiderDataHttpRequest = async (id, data) => {
    try {
        await axios.put(`/admin/riders/${id}`, data);
    } catch (error) {
        console.error("Error updating event:", error);
        throw error;
    }
}

export const suspendRider = async (id) => {
    try {
        await axios.put(`/admin/riderstatus/${id}`);
    } catch (error) {
        console.error("Error updating event:", error);
        throw error;
    }
}

export const deleteRiderDataHttpRequest = async (id) => {
    try {
        await axios.delete(`/admin/riders/${id}`);
    } catch (error) {
        console.error("Error deleting rider:", error);
        throw error;
    }
}


/* items */
export const fetchItemsHttpRequest = async () => {
    try {
        const response = await axios.get("/admin/items");
        return response.data.data;
    } catch (error) {
        console.error("Error fetching riders:", error);
        throw error;
    }
}



export const deleteItemHttpRequest = async (id) => {
    try {
        await axios.delete(`/admin/items/${id}`);
    } catch (error) {
        console.error("Error deleting car:", error);
        throw error;
    }
}


/* fetch single items */
export const fetchItemsIdHttpRequest = async (path) => {
    try {
        const response = await axios.get(`/admin${path}`);
        return response.data.data.items;
    } catch (error) {
        console.error("Error fetching riders:", error);
        throw error;
    }
}

export const fetchRestuarantHttpRequest = async (path) => {
    try {
        const response = await axios.get(`/admin${path}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching riders:", error);
        throw error;
    }
}

/* food */
export const saveFood = async (data) => {
    try {
        await axios.post("/admin/AddFoodToResturant", data);
    } catch (error) {
        console.error("Error saving food:", error);
        throw error;
    }
}
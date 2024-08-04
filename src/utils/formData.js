export const createFormData = (data) => {
    const formDataObj = new FormData();

    for (const key in data) {
        if (data[key] instanceof File) {
            formDataObj.append(key, data[key]);
        } else if (Array.isArray(data[key])) {
            data[key].forEach((item, index) => {
                formDataObj.append(`${key}[${index}]`, item);
            });
        } else if (data[key] !== null && data[key] !== undefined) {
            formDataObj.append(key, data[key]);
        }
    }

    return formDataObj;
};

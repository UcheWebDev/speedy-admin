// mixins/dateFormatter.js
export const formatEventDate = (startDate, endDate) => {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startDateFormatted = new Intl.DateTimeFormat('en-US', options).format(start);
    // const endDateFormatted = new Intl.DateTimeFormat('en-US', options).format(end);

    return `${startDateFormatted.split(' ')[0]} ${start.getDate()}-${end.getDate()}, ${end.getFullYear()}`;
}


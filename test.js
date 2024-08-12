const arr = [0, 12, 3, 8, 92, 0]

const sortedArray = arr.filter(num => num !== 0).sort((a, b) => a - b).concat(arr.filter(num => num == 0))


console.log(sortedArray);


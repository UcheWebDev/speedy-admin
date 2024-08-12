import { ref } from "vue";

export const categories = ref([
    {
        category: 'Foods & Beverages',
        subcategories: [
            'Foods',
            'Snacks',
            'Beverages',
            'Frozen Foods',
            'Bakery Products',
            'Dairy Products',
            'Canned Goods'
        ]
    },
    {
        category: 'Health & Personal Care',
        subcategories: [
            'Cosmetics',
            'Medicines',
            'Health Supplements',
            'Personal Care',
            'Vitamins',
            'First Aid',
            'Medicinal Herbs',
            'Dietary Aids',
            'Over-the-Counter Medications'
        ]
    },
    {
        category: 'Home & Cleaning',
        subcategories: [
            'Cleaning Supplies',
            'Household Items',
            'Furniture',
            'Decor & Lighting',
            'Kitchenware'
        ]
    },
    {
        category: 'Baby & Pet Supplies',
        subcategories: [
            'Baby Products',
            'Pet Supplies'
        ]
    },
    {
        category: 'Electronics & Accessories',
        subcategories: [
            'Mobile Phones',
            'Laptops',
            'Tablets',
            'Headphones',
            'Smartwatches',
            'Cameras',
            'Televisions',
            'Home Appliances',
            'Gaming Consoles',
            'Chargers & Cables',
            'Smart Home Devices',
            'Speakers',
            'External Storage',
            'Networking Equipment',
            'Wearable Technology'
        ]
    },
    {
        category: 'Office & Stationery',
        subcategories: [
            'Office Supplies',
            'Books & Stationery'
        ]
    },
    {
        category: 'Outdoor & Sports',
        subcategories: [
            'Outdoor Gear',
            'Sports Equipment'
        ]
    },
    {
        category: 'Toys, Hobbies & Crafts',
        subcategories: [
            'Toys & Games',
            'Crafts & Hobbies'
        ]
    },
    {
        category: 'Automotive & Garden',
        subcategories: [
            'Automotive Accessories',
            'Garden Supplies'
        ]
    },
    {
        category: 'Clothing & Accessories',
        subcategories: [
            'Jewelry & Watches',
            'Clothing & Accessories',
            'Footwear'
        ]
    },
    {
        category: 'Seasonal',
        subcategories: [
            'Seasonal Items'
        ]
    }
]);


export const foodTypes = ref([
    'Soup',
    'Rice',
    'Protein',
    'Breakfast',
    'Chicken',
    'Pasta',
    'Pastries',
    'Pizza',
    'Drinks'
])



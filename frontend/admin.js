//admin.js
const productsContainer = document.getElementById('products-container');
const inputNameOfTheProduct = document.getElementById('inputNameOfTheProduct');
const descriptionOfTheProduct = document.getElementById('descriptionOfTheProduct');
const inputPriceOfTheProduct = document.getElementById('inputPriceOfTheProduct');
const productCategories = document.getElementById('product-categories');
const inputPhotoOfTheProduct = document.getElementById('inputPhotoOfTheProduct');
const addProductBtn = document.getElementById('addProductBtn');

addProductBtn.addEventListener('click', async () => {
    const newProduct = {
        Name: inputNameOfTheProduct.value,
        Category: productCategories.value,
        Description: descriptionOfTheProduct.value,
        Price: parseFloat(inputPriceOfTheProduct.value),
        PhotoLinks: [inputPhotoOfTheProduct.value],
    }
    const postResponse = await fetch("http://localhost:5160/api/products", {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(newProduct),
    });
});


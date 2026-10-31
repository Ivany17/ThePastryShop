//admin.js
renderHeader('admin');
renderFooter('admin');

const productsContainer = document.getElementById('products-container');
const inputNameOfTheProduct = document.getElementById('inputNameOfTheProduct');
const descriptionOfTheProduct = document.getElementById('descriptionOfTheProduct');
const inputPriceOfTheProduct = document.getElementById('inputPriceOfTheProduct');
const productCategories = document.getElementById('product-categories');
const inputPhotoOfTheProduct = document.getElementById('inputPhotoOfTheProduct');
const addProductBtn = document.getElementById('addProductBtn');
let removeBtn;
let editBtn;
const modalOverlay = document.querySelector('.modal-overlay');
const editNameOfTheProduct = document.getElementById('editNameOfTheProduct');
const editDescriptionOfTheProduct = document.getElementById('editDescriptionOfTheProduct');
const editPriceOfTheProduct = document.getElementById('editPriceOfTheProduct');
const editProductCategories = document.getElementById('edit-product-categories');
const editPhotoOfTheProduct = document.getElementById('editPhotoOfTheProduct');
const saveChangesBtn = document.getElementById('saveChangesBtn');
const cancelBtn = document.getElementById('cancelBtn');
let currentEditId;
let data;
let currentProductsByCategory; // stores the current list of products in certain category

const searchProducts = document.getElementById('searchProducts');
searchProducts.addEventListener('input', () => {
    const filteredByName = currentProductsByCategory.filter(p => p.name.toLowerCase().includes(searchProducts.value.toLowerCase()));
    renderAdminProducts(filteredByName);
    findRemoveAndEditBtns();
});

function showCurrentListOfProducts(currentListOfProducts) {
    currentProductsByCategory = currentListOfProducts;
    renderAdminProducts(currentProductsByCategory);
    findRemoveAndEditBtns();
    searchProducts.value = '';
}

function showFilteredProductsByCategory(category) {
    const currentList = data.filter(p => p.category.toLowerCase() === category);
    showCurrentListOfProducts(currentList);
}

const headerAllBtn = document.getElementById('headerAllBtn');
headerAllBtn.addEventListener('click', () => {
    showCurrentListOfProducts(data);
});

const headerCakesBtn = document.getElementById('headerCakesBtn');
headerCakesBtn.addEventListener('click', () => {
    showFilteredProductsByCategory('cake');
});

const headerPastriesBtn = document.getElementById('headerPastriesBtn');
headerPastriesBtn.addEventListener('click', () => {
    showFilteredProductsByCategory('pastry');
});

const headerCookiesBtn = document.getElementById('headerCookiesBtn');
headerCookiesBtn.addEventListener('click', () => {
    showFilteredProductsByCategory('cookie');
});

async function loadAdminProducts() {
    const getResponse = await fetch('http://localhost:5160/api/products');
    data = await getResponse.json();
    showCurrentListOfProducts(data);
}

function renderAdminProducts(productsArray) {
    if (data.length === 0) {
        // if there are no products from the server at all, this check runs first; otherwise, the message 'This item is not found' would have triggered earlier
        productsContainer.innerHTML = `There are no products yet`;
        return;
    } else if (productsArray.length === 0) {
        // if the product is not found in the search or in a specific category
        productsContainer.innerHTML = `This item is not found`;
        return;
    }
    const productsHTML = productsArray
        .sort((a, b) => b.id - a.id) // Sort products from newest to oldest
        .map(p => {
            // Capitalize first letter in name and category for display only (data stays lowercase)
            return `
            <div class="product-card">
                <h3>${capitalizeEachWord(p.name)}</h3>
                <p>${capitalizeEachWord(p.category)}</p> 
                <p>${p.description}</p>
                <p>${p.price} ₴</p>
                <button class="removeBtn" data-id="${p.id}" data-name="${p.name}">Remove</button>
                <button class="editBtn" data-id="${p.id}">Edit</button>
            </div>
        `;
        })
        .join('');
    productsContainer.innerHTML = productsHTML;
}

function findRemoveAndEditBtns() {
    removeBtn = document.querySelectorAll('.removeBtn');
    removeBtn.forEach(b => {
        b.addEventListener('click', async () => {
            if (!confirm(`Do you really want to delete ${b.dataset.name}?`)) {
                return;
            } else {
                const removeResponse = await fetch(`http://localhost:5160/api/products/${b.dataset.id}`, {
                    method: 'DELETE',
                });
                loadAdminProducts();
                showToastMessage(`${b.dataset.name} deleted successfully`);
            }
        });
    });
    editBtn = document.querySelectorAll('.editBtn');
    editBtn.forEach(b => {
        b.addEventListener('click', () => {
            // Find the product with its id, not with saving it in HTML to avoid errors from/with special characters
            const editProduct = data.find(d => d.id === parseInt(b.dataset.id));
            editNameOfTheProduct.value = editProduct.name;
            editDescriptionOfTheProduct.value = editProduct.description;
            editPriceOfTheProduct.value = editProduct.price;
            editProductCategories.value = editProduct.category.toLowerCase(); // to compare two values from drop-down list and from database, where one value can be with the capital letter
            editPhotoOfTheProduct.value = editProduct.photoLinks;
            modalOverlay.style.display = 'flex';
            currentEditId = editProduct.id;
        });
    });
}

addProductBtn.addEventListener('click', async () => {
    const newProduct = {
        Name: removeExtraSpaces(inputNameOfTheProduct.value), // from shared.js to prevent data containing extra spaces from reaching the server
        Category: productCategories.value,
        Description: removeExtraSpaces(descriptionOfTheProduct.value),
        Price: parseFloat(inputPriceOfTheProduct.value),
        PhotoLinks: [inputPhotoOfTheProduct.value],
    };
    if (newProduct.Name.length === 0 || newProduct.Description.length === 0 || Number.isNaN(newProduct.Price) || newProduct.Price <= 0) {
        showToastMessage('All fields must be filled in. And the price must be greater than 0');
        return;
    }
    const postResponse = await fetch('http://localhost:5160/api/products', {
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(newProduct),
    });
    loadAdminProducts();
    if (postResponse.ok) {
        // clear form fields and display a toast message only if the response from the server is successful. Therefore, in the event of an error, the form remains filled out, and the administrator can correct the data.
        inputNameOfTheProduct.value = ''; // clearing the field after sending data to the server
        descriptionOfTheProduct.value = '';
        inputPriceOfTheProduct.value = '';
        inputPhotoOfTheProduct.value = ''; // clearing the plain text, not the array that is created within the object.
        productCategories.selectedIndex = 0; // reset the drop-down list—where the first option equals 0—so that the category is set back to the default for the next product.
        showToastMessage(`${capitalizeEachWord(newProduct.Name)} added successfully to the ${capitalizeEachWord(newProduct.Category)} category`); // at this moment, the form fields have already been cleared, and the object still holds the values.
    }
});

modalOverlay.style.display = 'none'; // hide the modal window

saveChangesBtn.addEventListener('click', async () => {
    const changedProduct = {
        Name: removeExtraSpaces(editNameOfTheProduct.value),
        Category: editProductCategories.value,
        Description: removeExtraSpaces(editDescriptionOfTheProduct.value),
        Price: parseFloat(editPriceOfTheProduct.value),
        PhotoLinks: [editPhotoOfTheProduct.value],
    };
    if (changedProduct.Name.length === 0 || changedProduct.Description.length === 0 || Number.isNaN(changedProduct.Price) || changedProduct.Price <= 0) {
        showToastMessage('All fields must be filled in. And the price must be greater than 0');
        return;
    }
    const putResponse = await fetch(`http://localhost:5160/api/products/${currentEditId}`, {
        method: 'PUT',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(changedProduct),
    });
    loadAdminProducts();
    modalOverlay.style.display = 'none'; // hide the modal window
});

cancelBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'none'; // hide the modal window
});

loadAdminProducts();

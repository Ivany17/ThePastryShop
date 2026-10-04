//admin.js
renderHeader("admin");

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

function showCurrentListOfProducts(currentListOfProducts){
    currentProductsByCategory = currentListOfProducts;
    renderAdminProducts(currentProductsByCategory);
    findRemoveAndEditBtns();
    searchProducts.value = "";
}

function showFilteredProductsByCategory(category){
    const currentList = data.filter(p => p.category.toLowerCase() === category);
    showCurrentListOfProducts(currentList);
}

const headerAllBtn = document.getElementById('headerAllBtn');
headerAllBtn.addEventListener('click', () => {
    showCurrentListOfProducts(data);
});

const headerCakesBtn = document.getElementById('headerCakesBtn');
headerCakesBtn.addEventListener('click', () => {
    showFilteredProductsByCategory("cake");
});

const headerPastriesBtn = document.getElementById('headerPastriesBtn');
headerPastriesBtn.addEventListener('click', () => {
    showFilteredProductsByCategory("pastry");
});

const headerCookiesBtn = document.getElementById('headerCookiesBtn');
headerCookiesBtn.addEventListener('click', () => {
    showFilteredProductsByCategory("cookie");
});

async function loadAdminProducts(){
    const getResponse = await fetch("http://localhost:5160/api/products");
    data = await getResponse.json();
    showCurrentListOfProducts(data);
};

function renderAdminProducts(productsArray){
    const productsHTML = productsArray.sort((a, b) => b.id - a.id) // Sort products from newest to oldest
    .map((p) => {
        // Capitalize first letter in name and category for display only (data stays lowercase)
        return `
            <div class="product-card">
                <h3>${p.name.toLowerCase().split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')}</h3>
                <p>${p.category.charAt(0).toUpperCase() + p.category.slice(1)}</p> 
                <p>${p.description}</p>
                <p>${p.price} ₴</p>
                <button class="removeBtn" data-id="${p.id}" data-name="${p.name}">Remove</button>
                <button class="editBtn" data-id="${p.id}">Edit</button>
            </div>
        `;
    }).join("");
    productsContainer.innerHTML = productsHTML;
}

function findRemoveAndEditBtns(){
    removeBtn = document.querySelectorAll(".removeBtn");
    removeBtn.forEach(b => {
        b.addEventListener('click', async () => {
            if(!confirm(`Do you really want to delete ${b.dataset.name}?`)){
                return
            } else {
                const removeResponse = await fetch(`http://localhost:5160/api/products/${b.dataset.id}`, {
                    method: 'DELETE'
                });
            loadAdminProducts();
            alert(`${b.dataset.name} deleted successfully`);
            }
        });
    });
    editBtn = document.querySelectorAll(".editBtn");
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
    loadAdminProducts();
});

modalOverlay.style.display = 'none'; // hide the modal window

saveChangesBtn.addEventListener('click', async() => {
    const changedProduct = {
        Name: editNameOfTheProduct.value,
        Category: editProductCategories.value,
        Description: editDescriptionOfTheProduct.value,
        Price: parseFloat(editPriceOfTheProduct.value),
        PhotoLinks: [editPhotoOfTheProduct.value],
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
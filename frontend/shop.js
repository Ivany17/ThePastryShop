//shop.js
let data;
let currentProductsByCategory; // stores the current list of products in certain category
renderHeader("shop");
renderFooter("shop");

const queryString = window.location.search; // get queryString - the part of address with "?" and further
const params = new URLSearchParams(queryString); // make the object from the string
const categoryParam = params.get('category'); // get the value from the category to filter by category

const searchProducts = document.getElementById('searchProducts');
searchProducts.addEventListener('input', () => {
    const filteredByName = currentProductsByCategory.filter(p => p.name.toLowerCase().includes(searchProducts.value.toLowerCase())); // search only in certain category
    renderProducts(filteredByName);
    findAddBtn();
});

function showCurrentListOfProducts(currentListOfProducts){
    currentProductsByCategory = currentListOfProducts;
    renderProducts(currentProductsByCategory.sort((a, b) => b.id - a.id)); // Sort products from newest to oldest
    findAddBtn();
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

const productsContainer = document.getElementById('products-container');
let addBtn;

async function loadProducts() {
    const getResponse = await fetch("http://localhost:5160/api/products");
    data = await getResponse.json();
    const filterByCategories = data.filter(p => p.category.toLowerCase() === categoryParam);
    if(categoryParam === null){ // null means the absence of a category
        showCurrentListOfProducts(data);
    } else {
        showCurrentListOfProducts(filterByCategories);
    }
}

function renderProducts(productsArray){
    if(productsArray.length === 0){
        productsContainer.innerHTML = `This item is not found`;
        return;
    }
    const productsHTML = productsArray.map((p) => {
        // Capitalize first letter in name and category for display only (data stays lowercase)
        return `
            <div class="product-card">
                <h3>${p.name.toLowerCase().split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')}</h3>
                <p>${p.category.charAt(0).toUpperCase() + p.category.slice(1)}</p> 
                <p>${p.description}</p>
                <p>${p.price} ₴</p>
                <button class="addBtn" data-id="${p.id}">Add</button>
            </div>
        `;
    }).join("");
    productsContainer.innerHTML = productsHTML;
}

function findAddBtn(){
    addBtn = document.querySelectorAll(".addBtn");
    addBtn.forEach(b => {
        b.addEventListener('click', () => {
            console.log(`${b.dataset.id}`);
        });
    });
}

loadProducts();

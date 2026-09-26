//shop.js
let data;
renderHeader("shop");

const headerAllBtn = document.getElementById('headerAllBtn');
headerAllBtn.addEventListener('click', () => {
    renderProducts(data);  
    findAddBtn();
});

const headerCakesBtn = document.getElementById('headerCakesBtn');
headerCakesBtn.addEventListener('click', () => {
    const filteredForCake = data.filter(p => p.category.toLowerCase() === "cake");
    renderProducts(filteredForCake);
    findAddBtn();
});

const headerPasteriesBtn = document.getElementById('headerPasteriesBtn');
headerPasteriesBtn.addEventListener('click', () => {
    const filteredForPasteries = data.filter(p => p.category.toLowerCase() === "pastry");
    renderProducts(filteredForPasteries);
    findAddBtn();
});

const headerCookiesBtn = document.getElementById('headerCookiesBtn');
headerCookiesBtn.addEventListener('click', () => {
    const filteredForCookies = data.filter(p => p.category.toLowerCase() === "cookie");
    renderProducts(filteredForCookies);
    findAddBtn();
});

const productsContainer = document.getElementById('products-container');
let addBtn;

async function loadProducts() {
    const getResponse = await fetch("http://localhost:5160/api/products");
    data = await getResponse.json();
    renderProducts(data.sort((a, b) => b.id - a.id)); // Sort products from newest to oldest
    findAddBtn();
}

function renderProducts(productsArray){
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

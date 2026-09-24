//shop.js
let data;
renderHeader("shop");

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
    renderProducts(data);
    findAddBtn();
}

function renderProducts(productsArray){
    const productsHTML = productsArray.map((p) => {
        return `
            <div class="product-card">
                <h3>${p.name}</h3>
                <p>${p.category}</p>
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

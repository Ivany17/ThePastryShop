//shop.js
renderHeader("shop");

const productsContainer = document.getElementById('products-container');
let addBtn;

async function loadProducts() {
    const getResponse = await fetch("http://localhost:5160/api/products");
    const data = await getResponse.json();
    const productsHTML = data.map((p) => {
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
    addBtn = document.querySelectorAll(".addBtn");
    addBtn.forEach(b => {
        b.addEventListener('click', () => {
            console.log(`${b.dataset.id}`);
        });
    });
}

loadProducts();

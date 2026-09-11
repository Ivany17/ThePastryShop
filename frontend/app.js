const productsContainer = document.getElementById('products-container');

async function loadProducts() {
    const getResponse = await fetch("http://localhost:5160/api/products");
    const data = await getResponse.json();
    const productsHTML = data.map((p) => {
        return `
            <div class="product-card">
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <p>${p.price} ₴</p>
                <button class="addBtn">Add</button>
            </div>
        `;
    }).join("");
    productsContainer.innerHTML = productsHTML;
}

loadProducts();
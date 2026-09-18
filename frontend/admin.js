//admin.js
const productsContainer = document.getElementById('products-container');
const inputNameOfTheProduct = document.getElementById('inputNameOfTheProduct');
const descriptionOfTheProduct = document.getElementById('descriptionOfTheProduct');
const inputPriceOfTheProduct = document.getElementById('inputPriceOfTheProduct');
const productCategories = document.getElementById('product-categories');
const inputPhotoOfTheProduct = document.getElementById('inputPhotoOfTheProduct');
const addProductBtn = document.getElementById('addProductBtn');

async function loadAdminProducts(){
    const getResponse = await fetch("http://localhost:5160/api/products");
    const data = await getResponse.json();
    const productsHTML = data.map((p) => {
        return `
            <div class="product-card">
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <p>${p.price} ₴</p>
                <button class="addBtn" data-id="${p.id}">Add</button>
            </div>
        `;
    }).join("");
    productsContainer.innerHTML = productsHTML;
    removeBtn = document.querySelectorAll(".removeBtn");
    removeBtn.forEach(b => {
        b.addEventListener('click', () => {
            console.log(`${b.dataset.id}`);
        });
    });
};

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

loadAdminProducts();
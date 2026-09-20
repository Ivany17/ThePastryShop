//admin.js
const productsContainer = document.getElementById('products-container');
const inputNameOfTheProduct = document.getElementById('inputNameOfTheProduct');
const descriptionOfTheProduct = document.getElementById('descriptionOfTheProduct');
const inputPriceOfTheProduct = document.getElementById('inputPriceOfTheProduct');
const productCategories = document.getElementById('product-categories');
const inputPhotoOfTheProduct = document.getElementById('inputPhotoOfTheProduct');
const addProductBtn = document.getElementById('addProductBtn');
let removeBtn;
const modalOverlay = document.querySelector('.modal-overlay');
const editNameOfTheProduct = document.getElementById('editNameOfTheProduct');
const editDescriptionOfTheProduct = document.getElementById('editDescriptionOfTheProduct');
const editPriceOfTheProduct = document.getElementById('editPriceOfTheProduct');
const editProductCategories = document.getElementById('edit-product-categories');
const editPhotoOfTheProduct = document.getElementById('editPhotoOfTheProduct');
const saveChangesBtn = document.getElementById('saveChangesBtn');
const cancelBtn = document.getElementById('cancelBtn');
let currentEditId;

async function loadAdminProducts(){
    const getResponse = await fetch("http://localhost:5160/api/products");
    const data = await getResponse.json();
    const productsHTML = data.map((p) => {
        return `
            <div class="product-card">
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <p>${p.price} ₴</p>
                <button class="removeBtn" data-id="${p.id}" data-name="${p.name}">Remove</button>
                <button class="editBtn" data-product='${JSON.stringify(p)}'>Edit</button>
            </div>
        `;
    }).join("");
    productsContainer.innerHTML = productsHTML;
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
            const editProduct = JSON.parse(b.dataset.product);
            editNameOfTheProduct.value = editProduct.name;
            editDescriptionOfTheProduct.value = editProduct.description;
            editPriceOfTheProduct.value = editProduct.price;
            editProductCategories.value = editProduct.category;
            editPhotoOfTheProduct.value = editProduct.photoLinks;
            modalOverlay.style.display = 'flex';
            currentEditId = editProduct.id;
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
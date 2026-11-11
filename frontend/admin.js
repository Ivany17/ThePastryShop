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
let currentProductsByCategory; // stores the current list of products in certain category.
let currentCategory = null; // Stores the selected category. After adding, editing, or deleting a product, the user remains in the current category. `null` indicates that no specific category has been selected.

// It is called from the search handler and the `loadAdminProducts` function, and it filters the list based on the search field value so that the screen matches the field after the data is updated.
function filterAndShowByName(){
    if(!currentProductsByCategory){  // If the list of products fails to load for any reason, the `return` prevents .filter from being called on undefined.
        return;
    }
    const filteredByName = currentProductsByCategory.filter(p => p.name.toLowerCase().includes(removeExtraSpaces(searchProducts.value.toLowerCase())));
    renderAdminProducts(filteredByName);
    findRemoveAndEditBtns();
}

const searchProducts = document.getElementById('searchProducts');
searchProducts.addEventListener('input', () => {
    filterAndShowByName();
});

function showCurrentListOfProducts(currentListOfProducts){
    currentProductsByCategory = currentListOfProducts;
    renderAdminProducts(currentProductsByCategory);
    findRemoveAndEditBtns();
}

function showFilteredProductsByCategory(category){
    if(!data){
        return;
    }
    const currentList = data.filter(p => p.category.toLowerCase() === category);
    currentCategory = category;
    showCurrentListOfProducts(currentList);
}

const headerAllBtn = document.getElementById('headerAllBtn');
headerAllBtn.addEventListener('click', () => {
    if(!data){
        return;
    }
    currentCategory = null;
    searchProducts.value = '';
    showCurrentListOfProducts(data);
});

const headerCakesBtn = document.getElementById('headerCakesBtn');
headerCakesBtn.addEventListener('click', () => {
    searchProducts.value = '';
    showFilteredProductsByCategory('cake');
});

const headerPastriesBtn = document.getElementById('headerPastriesBtn');
headerPastriesBtn.addEventListener('click', () => {
    searchProducts.value = '';
    showFilteredProductsByCategory('pastry');
});

const headerCookiesBtn = document.getElementById('headerCookiesBtn');
headerCookiesBtn.addEventListener('click', () => {
    searchProducts.value = '';
    showFilteredProductsByCategory('cookie');
});

async function loadAdminProducts(){
    try {
        const getResponse = await fetch('http://localhost:5160/api/products');
        if(!getResponse.ok){ // catch only handles an unreachable server, so a server error response is stopped here before it is read as a list.
            productsContainer.innerHTML = `Failed to load products. The server returned an error.`;
            return;
        }
        data = await getResponse.json();
        if(currentCategory){
            showFilteredProductsByCategory(currentCategory);
        } else {
            showCurrentListOfProducts(data);
        }
        filterAndShowByName();
    } catch (error){
        productsContainer.innerHTML = `Failed to load products. Check if the server is running.`;
        console.error(error); // Outputs the actual cause of the error to the console for the developer.
    }
}

function renderAdminProducts(productsArray){
    if(data.length === 0){ // if there are no products from the server at all, this check runs first; otherwise, the message 'This item is not found' would have triggered earlier.
        productsContainer.innerHTML = `There are no products yet`;
        return;
    } else if(productsArray.length === 0){ // if the product is not found in the search or in a specific category.
        productsContainer.innerHTML = `This item is not found`;
        return;
    }
       const sortedCopyOfProducts = [...productsArray].sort((a, b) => b.id - a.id); // sorts a copy, not the original list, which search and categories also use; a larger id means a newer product, so this puts the newest first.
    const productsHTML = sortedCopyOfProducts.map(p => { // Capitalize first letter in every word in name and category for display only (data doesn't change).
        return `
            <div class="product-card">
                <h3>${safeHTMLcodes(capitalizeEachWord(p.name))}</h3>
                <p>${safeHTMLcodes(capitalizeEachWord(p.category))}</p>
                <p>${safeHTMLcodes(p.description)}</p>
                <p>${showPriceWithTwoDecimalPlaces(p.price)} ₴</p>
                <button class="removeBtn" data-id="${p.id}">Remove</button>
                <button class="editBtn" data-id="${p.id}">Edit</button>
            </div>
        `;}).join('');
    productsContainer.innerHTML = productsHTML;
}

function findRemoveAndEditBtns(){
    const removeBtn = document.querySelectorAll('.removeBtn');
    removeBtn.forEach(b => {
        b.addEventListener('click', async () => {
            const removedProduct = data.find(d => d.id === parseInt(b.dataset.id, 10)); // To prevent parseInt from having to guess the number system, the number 10 after the comma indicates that this is definitely a decimal number.
            if(!confirm(`Do you really want to delete ${capitalizeEachWord(removedProduct.name)}?`)){
                return;
            } else {
                try {
                    const removeResponse = await fetch(`http://localhost:5160/api/products/${b.dataset.id}`, {
                        method: 'DELETE',
                    });
                    loadAdminProducts();
                    if(removeResponse.ok){
                        showToastMessage(`${capitalizeEachWord(removedProduct.name)} deleted successfully`);
                    } else {
                        showToastMessage(`${capitalizeEachWord(removedProduct.name)} was not deleted`);
                    }
                } catch (error){
                    showToastMessage(`${capitalizeEachWord(removedProduct.name)} was not deleted. Check if the server is running.`);
                    console.error(error);
                }
            }
        });
    });
    const editBtn = document.querySelectorAll('.editBtn');
    editBtn.forEach(b => {
        b.addEventListener('click', () => { // Find the product with its id, not with saving it in HTML to avoid errors from/with special characters.
            const editProduct = data.find(d => d.id === parseInt(b.dataset.id, 10));
            editNameOfTheProduct.value = editProduct.name;
            editDescriptionOfTheProduct.value = editProduct.description;
            editPriceOfTheProduct.value = editProduct.price;
            editProductCategories.value = editProduct.category.toLowerCase(); // to compare two values from drop-down list and from database, where one value can be with the capital letter.
            editPhotoOfTheProduct.value = editProduct.photoLinks;
            modalOverlay.style.display = 'flex';
            currentEditId = editProduct.id;
        });
    });
}

addProductBtn.addEventListener('click', async () => {
    const newProduct = {
        Name: removeExtraSpaces(inputNameOfTheProduct.value), // from shared.js to prevent data containing extra spaces from reaching the server.
        Category: productCategories.value,
        Description: removeExtraSpaces(descriptionOfTheProduct.value),
        Price: parseFloat(inputPriceOfTheProduct.value),
        PhotoLinks: [inputPhotoOfTheProduct.value],
    };
    if(hasTheFormEmptyFields(newProduct)){
        showToastMessage('All fields must be filled in. And the price must be greater than 0');
        return;
    }
    addProductBtn.disabled = true;
    try {
        const postResponse = await fetch('http://localhost:5160/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct),
        });
        loadAdminProducts();
        if(postResponse.ok){ // clear form fields and display a toast message only if the response from the server is successful. Therefore, in the event of an error, the form remains filled out, and the administrator can correct the data.
            inputNameOfTheProduct.value = ''; // clearing the field after sending data to the server.
            descriptionOfTheProduct.value = '';
            inputPriceOfTheProduct.value = '';
            inputPhotoOfTheProduct.value = ''; // clearing the plain text, not the array that is created within the object.
            productCategories.selectedIndex = 0; // reset the drop-down list—where the first option equals 0—so that the category is set back to the default for the next product.
            showToastMessage(`${capitalizeEachWord(newProduct.Name)} added successfully to the ${capitalizeEachWord(newProduct.Category)} category`); // at this moment, the form fields have already been cleared, and the object still holds the values.
        } else {
            showToastMessage(`${capitalizeEachWord(newProduct.Name)} was not added`);
        }
    } catch (error){
        showToastMessage(`${capitalizeEachWord(newProduct.Name)} was not added. Check if the server is running.`);
        console.error(error);
    } finally {
        addProductBtn.disabled = false;
    }
});

modalOverlay.style.display = 'none'; // hide the modal window.

saveChangesBtn.addEventListener('click', async () => {
    const changedProduct = {
        Name: removeExtraSpaces(editNameOfTheProduct.value),
        Category: editProductCategories.value,
        Description: removeExtraSpaces(editDescriptionOfTheProduct.value),
        Price: parseFloat(editPriceOfTheProduct.value),
        PhotoLinks: [editPhotoOfTheProduct.value],
    };
    if(hasTheFormEmptyFields(changedProduct)){
        showToastMessage('All fields must be filled in. And the price must be greater than 0');
        return;
    }
    saveChangesBtn.disabled = true;
    try {
        const putResponse = await fetch(`http://localhost:5160/api/products/${currentEditId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(changedProduct),
        });
        loadAdminProducts();
        if(putResponse.ok){
            modalOverlay.style.display = 'none'; // hide the modal window.
            showToastMessage(`${capitalizeEachWord(changedProduct.Name)} was changed`);
        } else {
            showToastMessage(`${capitalizeEachWord(changedProduct.Name)} was not changed`);
        }
    } catch (error){
        showToastMessage(`${capitalizeEachWord(changedProduct.Name)} was not changed. Check if the server is running.`);
        console.error(error);
    } finally {
        saveChangesBtn.disabled = false;
    }
});

cancelBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'none'; // hide the modal window.
});

loadAdminProducts();

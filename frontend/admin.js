//admin.js
import { // Thanks to imports, the file can access the functions and variables from `shared.js`. The import line immediately reveals the file's dependencies.
    renderHeader,
    renderFooter,
    serverAddress,
    findProductById,
    showToastMessage,
    capitalizeEachWord,
    removeExtraSpaces,
    hasTheFormEmptyFields,
    showPriceWithTwoDecimalPlaces,
    showErrorMessage,
    safeHTMLcodes
} from './shared.js';

let currentEditId;
let listOfAdminProducts;
let currentAdminProductsByCategory; // Stores the current list of products in certain category.
let currentCategory = null; // Stores the selected category. After adding, editing, or deleting a product, the user remains in the current category. `null` indicates that no specific category has been selected.
const adminProductsContainer = document.getElementById('products-container');
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

modalOverlay.style.display = 'none'; // Hide the modal window.

renderHeader('admin');
renderFooter('admin');

const searchAdminProducts = document.getElementById('searchProducts');
const headerAllBtn = document.getElementById('headerAllBtn');
const headerCakesBtn = document.getElementById('headerCakesBtn');
const headerPastriesBtn = document.getElementById('headerPastriesBtn');
const headerCookiesBtn = document.getElementById('headerCookiesBtn');

headerAllBtn.addEventListener('click', () => {
    if(!listOfAdminProducts){
        return;
    }
    currentCategory = null;
    searchAdminProducts.value = '';
    showCurrentListOfProducts(listOfAdminProducts);
});

headerCakesBtn.addEventListener('click', () => {
    searchAdminProducts.value = '';
    showFilteredProductsByCategory('cake');
});

headerPastriesBtn.addEventListener('click', () => {
    searchAdminProducts.value = '';
    showFilteredProductsByCategory('pastry');
});

headerCookiesBtn.addEventListener('click', () => {
    searchAdminProducts.value = '';
    showFilteredProductsByCategory('cookie');
});

searchAdminProducts.addEventListener('input', () => {
    filterAndShowByName();
});

// It is called from the search handler and the `loadAdminProducts` function, and it filters the list based on the search field value so that the screen matches the field after the data is updated.
function filterAndShowByName(){
    if(!currentAdminProductsByCategory){ // If the list of products fails to load for any reason, the `return` prevents .filter from being called on undefined.
        return;
    }
    const filteredByName = currentAdminProductsByCategory.filter(product => product.name.toLowerCase().includes(removeExtraSpaces(searchAdminProducts.value.toLowerCase())));
    renderAdminProducts(filteredByName);
}

function showCurrentListOfProducts(currentListOfProducts){
    currentAdminProductsByCategory = currentListOfProducts;
    renderAdminProducts(currentAdminProductsByCategory);
}

function showFilteredProductsByCategory(category){
    if(!listOfAdminProducts){
        return;
    }
    const currentList = listOfAdminProducts.filter(product => product.category.toLowerCase() === category);
    currentCategory = category;
    showCurrentListOfProducts(currentList);
}

async function loadAdminProducts(){
    try {
        const getResponse = await fetch(`${serverAddress}/api/products`);
        if(!getResponse.ok){ // Catch only handles an unreachable server, so a server error response is stopped here before it is read as a list.
            adminProductsContainer.innerHTML = 'Failed to load products. The server returned an error.';
            console.error(`Failed to load the products. The server returned an error with ${getResponse.status}`);
            return;
        }
        listOfAdminProducts = await getResponse.json();
        if(currentCategory){
            showFilteredProductsByCategory(currentCategory);
        } else {
            showCurrentListOfProducts(listOfAdminProducts);
        }
        filterAndShowByName();
    } catch (error){
        adminProductsContainer.innerHTML = 'Failed to load products. Check if the server is running.';
        console.error(error); // Outputs the actual cause of the error to the console for the developer.
    }
}

function renderAdminProducts(productsArray){
    if(listOfAdminProducts.length === 0){ // If there are no products from the server at all, this check runs first; otherwise, the message 'This item is not found' would have triggered earlier.
        adminProductsContainer.innerHTML = 'There are no products yet';
        return;
    }
    if(productsArray.length === 0){ // If the product is not found in the search or in a specific category.
        adminProductsContainer.innerHTML = 'This item is not found';
        return;
    }
    const sortedCopyOfProducts = [...productsArray].sort((firstProduct, secondProduct) => secondProduct.id - firstProduct.id); // Sorts a copy, not the original list, which search and categories also use; a larger id means a newer product, so this puts the newest first.
    const productsHTML = sortedCopyOfProducts.map(product => { // Capitalize first letter in every word in name and category for display only (the product data doesn't change).
        const nameOfProductForHTML = safeHTMLcodes(capitalizeEachWord(product.name));
        // The Remove and Edit buttons have an `aria-label` so that a screen reader can announce which product the button belongs to.
        return `
            <div class="product-card">
                <h3>${nameOfProductForHTML}</h3>
                <p>${safeHTMLcodes(capitalizeEachWord(product.category))}</p>
                <p>${safeHTMLcodes(product.description)}</p>
                <p>${showPriceWithTwoDecimalPlaces(product.price)} ₴</p>
                <button class="removeBtn" data-id="${product.id}" aria-label="Remove ${nameOfProductForHTML} from the list">Remove</button>
                <button class="editBtn" data-id="${product.id}" aria-label="Edit ${nameOfProductForHTML}">Edit</button>
            </div>
        `;
    }).join('');
    adminProductsContainer.innerHTML = productsHTML;
}

async function removeProduct(button){
    const productToRemove = findProductById(listOfAdminProducts, button);
    if(productToRemove === undefined){ // If `productToRemove` is not found in the list, the function returns before reaching `confirm` and the request, to avoid working with `undefined`.
        return;
    }
    const nameOfTheProduct = capitalizeEachWord(productToRemove.name);
    if(!confirm(`Do you really want to remove ${nameOfTheProduct}?`)){
        return;
    }
    button.disabled = true;
    try {
        const removeResponse = await fetch(`${serverAddress}/api/products/${button.dataset.id}`, {
            method: 'DELETE',
        });
        loadAdminProducts();
        if(removeResponse.ok){
            showToastMessage(`${nameOfTheProduct} removed successfully`);
        } else {
            showErrorMessage(`${nameOfTheProduct} was not removed`, `Failed to remove the product. The server returned an error with ${removeResponse.status}`);
        }
    } catch (error){
        showErrorMessage(`${nameOfTheProduct} was not removed. Check if the server is running.`, error);
        button.disabled = false;
    }
}

function openEditWindow(button){
    const productToEdit = findProductById(listOfAdminProducts, button);
    if(productToEdit === undefined){
        return;
    }
    editNameOfTheProduct.value = productToEdit.name;
    editDescriptionOfTheProduct.value = productToEdit.description;
    editPriceOfTheProduct.value = productToEdit.price;
    editProductCategories.value = productToEdit.category.toLowerCase(); // To compare two values from drop-down list and from database, where one value can be with the capital letter.
    editPhotoOfTheProduct.value = productToEdit.photoLinks;
    modalOverlay.style.display = 'flex';
    currentEditId = productToEdit.id;
}

adminProductsContainer.addEventListener('click', (event) => { // A single event handler on a persistent container works for all buttons—even those created later—so it does not need to be re-attached after every re-render of the list.
    const removeBtn = event.target.closest('.removeBtn');
    const editBtn = event.target.closest('.editBtn');
    if(removeBtn){
        removeProduct(removeBtn);
    } else if(editBtn){
        openEditWindow(editBtn);
    }
});

addProductBtn.addEventListener('click', async () => {
    const newProduct = {
        Name: removeExtraSpaces(inputNameOfTheProduct.value), // From shared.js to prevent data containing extra spaces from reaching the server.
        Category: productCategories.value,
        Description: removeExtraSpaces(descriptionOfTheProduct.value),
        Price: parseFloat(inputPriceOfTheProduct.value),
        PhotoLinks: [inputPhotoOfTheProduct.value],
    };
    if(hasTheFormEmptyFields(newProduct)){
        showToastMessage('All fields must be filled in. And the price must be greater than 0');
        return;
    }
    const nameOfTheProduct = capitalizeEachWord(newProduct.Name);
    addProductBtn.disabled = true;
    try {
        const postResponse = await fetch(`${serverAddress}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct),
        });
        loadAdminProducts();
        if(postResponse.ok){ // Clear form fields and display a toast message only if the response from the server is successful. Therefore, in the event of an error, the form remains filled out, and the administrator can correct the data.
            inputNameOfTheProduct.value = ''; // Clearing the field after sending data to the server.
            descriptionOfTheProduct.value = '';
            inputPriceOfTheProduct.value = '';
            inputPhotoOfTheProduct.value = ''; // Clearing the plain text, not the array that is created within the object.
            productCategories.selectedIndex = 0; // Reset the drop-down list—where the first option equals 0—so that the category is set back to the default for the next product.
            showToastMessage(`${nameOfTheProduct} added successfully to the ${capitalizeEachWord(newProduct.Category)} category`); // At this moment, the form fields have already been cleared, and the object still holds the values.
        } else {
            showErrorMessage(`${nameOfTheProduct} was not added`, `Failed to add the product. The server returned an error with ${postResponse.status}`);
        }
    } catch (error){
        showErrorMessage(`${nameOfTheProduct} was not added. Check if the server is running.`, error);
    } finally {
        addProductBtn.disabled = false;
    }
});

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
    const nameOfTheProduct = capitalizeEachWord(changedProduct.Name);
    saveChangesBtn.disabled = true;
    try {
        const putResponse = await fetch(`${serverAddress}/api/products/${currentEditId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(changedProduct),
        });
        loadAdminProducts();
        if(putResponse.ok){
            modalOverlay.style.display = 'none';
            showToastMessage(`${nameOfTheProduct} was changed`);
        } else {
            showErrorMessage(`${nameOfTheProduct} was not changed`, `Failed to change the product. The server returned an error with ${putResponse.status}`);
        }
    } catch (error){
        showErrorMessage(`${nameOfTheProduct} was not changed. Check if the server is running.`, error);
    } finally {
        saveChangesBtn.disabled = false;
    }
});

cancelBtn.addEventListener('click', () => {
    modalOverlay.style.display = 'none';
});

loadAdminProducts();

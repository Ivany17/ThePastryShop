//shop.js
import { // Thanks to imports, the file can access the functions and variables from `shared.js`. The import line immediately reveals the file's dependencies.
    renderHeader,
    renderFooter,
    serverAddress,
    somethingWentWrongPhrase,
    findProductById,
    showToastMessage,
    capitalizeEachWord,
    removeExtraSpaces,
    showPriceWithTwoDecimalPlaces,
    showErrorMessage,
    safeHTMLcodes
} from './shared.js';
import {
    loadProductsInTheCart,
    launchTheCart
} from './cart.js';

let listOfShopProducts;
let currentShopProductsByCategory; // Stores the current list of products in certain category.
const queryString = window.location.search; // Get queryString - the part of address with "?" and further.
const params = new URLSearchParams(queryString); // Make the object from the string.
const categoryParam = params.get('category'); // Get the value from the category to filter by category.
const shopProductsContainer = document.getElementById('products-container');

renderHeader('shop');
renderFooter('shop');

const searchShopProducts = document.getElementById('searchProducts');
const headerAllBtn = document.getElementById('headerAllBtn');
const headerCakesBtn = document.getElementById('headerCakesBtn');
const headerPastriesBtn = document.getElementById('headerPastriesBtn');
const headerCookiesBtn = document.getElementById('headerCookiesBtn');

launchTheCart();

headerAllBtn.addEventListener('click', () => {
    if(!listOfShopProducts){
        return;
    }
    showCurrentListOfProducts(listOfShopProducts);
});

headerCakesBtn.addEventListener('click', () => {
    showFilteredProductsByCategory('cake');
});

headerPastriesBtn.addEventListener('click', () => {
    showFilteredProductsByCategory('pastry');
});

headerCookiesBtn.addEventListener('click', () => {
    showFilteredProductsByCategory('cookie');
});

searchShopProducts.addEventListener('input', () => {
    if(!currentShopProductsByCategory){ // If the list of products fails to load for any reason, the `return` prevents .filter from being called on undefined.
        return;
    }
    const filteredByName = currentShopProductsByCategory.filter(product => product.name.toLowerCase().includes(removeExtraSpaces(searchShopProducts.value.toLowerCase()))); // Search only in certain category.
    renderShopProducts(filteredByName);
});

function showCurrentListOfProducts(currentListOfProducts){
    currentShopProductsByCategory = [...currentListOfProducts].sort((firstProduct, secondProduct) => secondProduct.id - firstProduct.id); // Sorts a copy so the original list stays unchanged; the sorted list is stored here so that search filters it and keeps the newest-first order (a larger id means a newer product).
    renderShopProducts(currentShopProductsByCategory);
    searchShopProducts.value = '';
}

function showFilteredProductsByCategory(category){
    if(!listOfShopProducts){
        return;
    }
    const currentList = listOfShopProducts.filter(product => product.category.toLowerCase() === category);
    showCurrentListOfProducts(currentList);
}

async function addProductToTheCart(addBtn){
    const productToAdd = findProductById(listOfShopProducts, addBtn);
    if(productToAdd === undefined){ // If `productToAdd` is not found in the list, the function returns before the request is made; this prevents further operations with `undefined` and avoids showing the user an incorrect error.
        return;
    }
    const nameOfTheProduct = capitalizeEachWord(productToAdd.name);
    try {
        const postResponse = await fetch(`${serverAddress}/api/cart/${addBtn.dataset.id}`, { method: 'POST' }); // To add the product in the cart on the server.
        loadProductsInTheCart(); // A function from cart.js that runs after any reply from the server, successful or not, so that the cart on the screen always matches the server data.
        if(postResponse.ok){
            showToastMessage(`${nameOfTheProduct} was added to the cart`);
        } else {
            showErrorMessage(`${nameOfTheProduct} was not added to the cart`, `Failed to add the product in the cart. The server returned an error with ${postResponse.status}`);
        }
    } catch (error){
        showErrorMessage(somethingWentWrongPhrase, error);
    }
}

shopProductsContainer.addEventListener('click', (event) => { // A single event handler on a persistent container works for all buttons—even those created later—so it does not need to be re-attached after every re-render of the list.
    const addBtn = event.target.closest('.addBtn');
    if(addBtn === null){
        return;
    }
    addProductToTheCart(addBtn);
});

const errorLoadingProductsMessage = `We couldn't load the products. Please try again later.`;
async function loadProducts(){
    try {
        const getResponse = await fetch(`${serverAddress}/api/products`);
        if(!getResponse.ok){ // Catch only handles an unreachable server, so a server error response is stopped here before it is read as a list.
            shopProductsContainer.innerHTML = errorLoadingProductsMessage;
            console.error(`Failed to load the products. The server returned an error with ${getResponse.status}`);
            return;
        }
        listOfShopProducts = await getResponse.json();
        if(!categoryParam){ // If the category parameter is missing from the address or is empty, then all products are displayed.
            showCurrentListOfProducts(listOfShopProducts);
        } else {
            const filterByCategories = listOfShopProducts.filter(product => product.category.toLowerCase() === categoryParam.toLowerCase());
            showCurrentListOfProducts(filterByCategories);
        }
    } catch (error){
        shopProductsContainer.innerHTML = errorLoadingProductsMessage;
        console.error(error); // Outputs the actual cause of the error to the console for the developer.
    }
}

function renderShopProducts(productsArray){
    if(listOfShopProducts.length === 0){ // If the shop contains no products, this check is performed first; otherwise, the user would see the wrong message.
        shopProductsContainer.innerHTML = 'Sorry, our products are coming soon. Please check back later.';
        return;
    }
    if(productsArray.length === 0){ // If the product is not found in the search or in a specific category.
        shopProductsContainer.innerHTML = 'Unfortunately, this product was not found. Try searching for another product.';
        return;
    }
    const productsHTML = productsArray.map(product => { // Capitalize first letter in every word in name and category for display only (the product data doesn't change).
        const nameOfProductForHTML = safeHTMLcodes(capitalizeEachWord(product.name));
        // The Add button has an `aria-label` so that a screen reader can announce which product the button belongs to.
        return `
            <div class="product-card">
                <h3>${nameOfProductForHTML}</h3>
                <p>${safeHTMLcodes(capitalizeEachWord(product.category))}</p>
                <p>${safeHTMLcodes(product.description)}</p>
                <p>${showPriceWithTwoDecimalPlaces(product.price)} ₴</p>
                <button class="addBtn" data-id="${product.id}" aria-label="Add ${nameOfProductForHTML} to the cart">Add</button>
            </div>
        `;
    }).join('');
    shopProductsContainer.innerHTML = productsHTML;
}

loadProducts();

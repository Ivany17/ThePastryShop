//shop.js
let data;
let currentProductsByCategory; // stores the current list of products in certain category.
renderHeader('shop');
renderFooter('shop');

const queryString = window.location.search; // get queryString - the part of address with "?" and further.
const params = new URLSearchParams(queryString); // make the object from the string.
const categoryParam = params.get('category'); // get the value from the category to filter by category.

const searchProducts = document.getElementById('searchProducts');
searchProducts.addEventListener('input', () => {
    if(!currentProductsByCategory){ // If the list of products fails to load for any reason, the `return` prevents .filter from being called on undefined.
        return;
    }
    const filteredByName = currentProductsByCategory.filter(p => p.name.toLowerCase().includes(removeExtraSpaces(searchProducts.value.toLowerCase()))); // search only in certain category.
    renderProducts(filteredByName);
});

function showCurrentListOfProducts(currentListOfProducts){
    currentProductsByCategory = [...currentListOfProducts].sort((a, b) => b.id - a.id); // sorts a copy so the original list stays unchanged; the sorted list is stored here so that search filters it and keeps the newest-first order (a larger id means a newer product).
    renderProducts(currentProductsByCategory);
    searchProducts.value = '';
}

function showFilteredProductsByCategory(category){
    if(!data){
        return;
    }
    const currentList = data.filter(p => p.category.toLowerCase() === category);
    showCurrentListOfProducts(currentList);
}

const headerAllBtn = document.getElementById('headerAllBtn');
headerAllBtn.addEventListener('click', () => {
    if(!data){
        return;
    }
    showCurrentListOfProducts(data);
});

const headerCakesBtn = document.getElementById('headerCakesBtn');
headerCakesBtn.addEventListener('click', () => {
    showFilteredProductsByCategory('cake');
});

const headerPastriesBtn = document.getElementById('headerPastriesBtn');
headerPastriesBtn.addEventListener('click', () => {
    showFilteredProductsByCategory('pastry');
});

const headerCookiesBtn = document.getElementById('headerCookiesBtn');
headerCookiesBtn.addEventListener('click', () => {
    showFilteredProductsByCategory('cookie');
});

const productsContainer = document.getElementById('products-container');
productsContainer.addEventListener('click', (event) => {
    const addBtn = event.target.closest('.addBtn');
    if(addBtn === null){
        return;
    }
    addTheProductInTheCart(addBtn);
});

const errorLoadingMessage = `We couldn't load the products. Please try again later.`;
async function loadProducts(){
    try {
        const getResponse = await fetch(`${serverAddress}/api/products`);
        if(!getResponse.ok){ // catch only handles an unreachable server, so a server error response is stopped here before it is read as a list.
            productsContainer.innerHTML = errorLoadingMessage;
            console.error(`Failed to load the products. The server returned an error with ${getResponse.status}`);
            return;
        }
        data = await getResponse.json();
        if(!categoryParam){ // If the category parameter is missing from the address or is empty, then all products are displayed.
            showCurrentListOfProducts(data);
        } else {
            const filterByCategories = data.filter(p => p.category.toLowerCase() === categoryParam.toLowerCase());
            showCurrentListOfProducts(filterByCategories);
        }
    } catch (error){
        productsContainer.innerHTML = errorLoadingMessage;
        console.error(error); // Outputs the actual cause of the error to the console for the developer.
    }
}

function renderProducts(productsArray){
    if(data.length === 0){ // if there are no products from the server at all, this check runs first; otherwise, the message 'This item is not found' would have triggered earlier.
        productsContainer.innerHTML = `Sorry, our products are coming soon. Please check back later.`;
        return;
    } else if(productsArray.length === 0){ // if the product is not found in the search or in a specific category.
        productsContainer.innerHTML = `Unfortunately, this product was not found. Try searching for another product.`;
        return;
    }
    const productsHTML = productsArray
        .map(p => { // Capitalize first letter in every word in name and category for display only (data doesn't change).
            return `
            <div class="product-card">
                <h3>${safeHTMLcodes(capitalizeEachWord(p.name))}</h3>
                <p>${safeHTMLcodes(capitalizeEachWord(p.category))}</p>
                <p>${safeHTMLcodes(p.description)}</p>
                <p>${showPriceWithTwoDecimalPlaces(p.price)} ₴</p>
                <button class="addBtn" data-id="${p.id}">Add</button>
            </div>
        `;})
        .join('');
    productsContainer.innerHTML = productsHTML;
}

async function addTheProductInTheCart(button){
    const addedProduct = findProductById(data, button);
    if(addedProduct === undefined){ // If `addedProduct` is not found in the list, the function returns before the request is made; this prevents further operations with `undefined` and avoids showing the user an incorrect error.
        return;
    }
    const nameOfTheProduct = capitalizeEachWord(addedProduct.name);
    try {
        const postResponse = await fetch(`${serverAddress}/api/cart/${button.dataset.id}`, { method: 'POST' }); // to add the product in the cart on the server.
        loadProductsInTheCart(); // a function from cart.js that runs after any reply from the server, successful or not, so that the cart on the screen always matches the server data.
        if(postResponse.ok){
            showToastMessage(`${nameOfTheProduct} was added to the cart`);
        } else {
            showErrorMessage(`${nameOfTheProduct} was not added to the cart`, `Failed to add the product in the cart. The server returned an error with ${postResponse.status}`);
        }
    } catch (error){
        showErrorMessage(somethingWentWrongPhrase, error);
    }
}

loadProducts();

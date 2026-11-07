//shop.js
let data;
let currentProductsByCategory; // stores the current list of products in certain category
renderHeader('shop');
renderFooter('shop');

const queryString = window.location.search; // get queryString - the part of address with "?" and further
const params = new URLSearchParams(queryString); // make the object from the string
const categoryParam = params.get('category'); // get the value from the category to filter by category

const searchProducts = document.getElementById('searchProducts');
searchProducts.addEventListener('input', () => {
    if(!currentProductsByCategory){ // If the list of products fails to load for any reason, the `return` prevents .filter from being called on undefined.
        return;
    }
    const filteredByName = currentProductsByCategory.filter(p => p.name.toLowerCase().includes(removeExtraSpaces(searchProducts.value.toLowerCase()))); // search only in certain category
    renderProducts(filteredByName);
    findAddBtn();
});

function showCurrentListOfProducts(currentListOfProducts){
    currentProductsByCategory = currentListOfProducts;
    renderProducts(currentProductsByCategory.sort((a, b) => b.id - a.id)); // Sort products from newest to oldest
    findAddBtn();
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

const errorLoadingMessage = `We couldn't load the products. Please try again later.`;
async function loadProducts(){
    try {
        const getResponse = await fetch('http://localhost:5160/api/products');
        if(!getResponse.ok){ // catch only handles an unreachable server, so a server error response is stopped here before it is read as a list
            productsContainer.innerHTML = errorLoadingMessage;
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
    if(data.length === 0){ // if there are no products from the server at all, this check runs first; otherwise, the message 'This item is not found' would have triggered earlier
        productsContainer.innerHTML = `Sorry, our products are coming soon. Please check back later.`;
        return;
    } else if(productsArray.length === 0){ // if the product is not found in the search or in a specific category
        productsContainer.innerHTML = `Unfortunately, this product was not found. Try searching for another product.`;
        return;
    }
    const productsHTML = productsArray
        .map(p => { // Capitalize first letter in every word in name and category for display only (data doesn't change)
            return `
            <div class="product-card">
                <h3>${safeHTMLcodes(capitalizeEachWord(p.name))}</h3>
                <p>${safeHTMLcodes(capitalizeEachWord(p.category))}</p>
                <p>${safeHTMLcodes(p.description)}</p>
                <p>${p.price} ₴</p>
                <button class="addBtn" data-id="${p.id}">Add</button>
            </div>
        `;})
        .join('');
    productsContainer.innerHTML = productsHTML;
}

function findAddBtn(){
    const addBtn = document.querySelectorAll('.addBtn');
    addBtn.forEach(b => {
        b.addEventListener('click', async () => {
            const addedProduct = data.find(d => d.id === parseInt(b.dataset.id, 10)); // To prevent parseInt from having to guess the number system, the number 10 after the comma indicates that this is definitely a decimal number.
            try {
                const postResponse = await fetch(`http://localhost:5160/api/cart/${b.dataset.id}`, { method: 'POST' }); // to add the product in the cart on the server
                loadProductsInTheCart(); // a function from the cart.js file that will load new product cards, read the cart and draw the cards. This call goes after the fetch, because the card is already saved on the server
                if(postResponse.ok){
                    showToastMessage(`${capitalizeEachWord(addedProduct.name)} was added to the cart`);
                } else {
                    showToastMessage(`${capitalizeEachWord(addedProduct.name)} was not added to the cart`);
                }
            } catch (error){
                showToastMessage(`Something went wrong. Please try again`);
                console.error(error);
            }
        });
    });
}

loadProducts();

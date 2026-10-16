//cart.js
const cartBtn = document.getElementById('cartBtn');
const cartContainer = document.getElementById('cart-container');
let cartData; // declare the variable outside so that all functions can use it.

cartBtn.addEventListener('click', () => {
    cartContainer.classList.toggle('openCart'); // add and remove a class with a single click using `toggle`.
    if(cartContainer.classList.contains('openCart')){ // if the class is added, load the product cards in the cart.
        loadProductsInTheCart();
    }
});

async function loadProductsInTheCart(){
    const getCartResponse = await fetch(`http://localhost:5160/api/cart`);
    cartData = await getCartResponse.json(); // convert the JSON into an object so that it can be used later.
}

function renderProductsInTheCart(cartData){
    if(cartData.length === 0){
        cartContainer.innerHTML = `This item is not found`;
        return;
    }
    const productsHTML = cartData.map((cardInTheCart) => {
        // Capitalize first letter in name and category for display only (data stays lowercase)
        return `
            <div class="product-card-in-the-cart">
                <h3>${cardInTheCart.productItem.name.toLowerCase().split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')}</h3>
            </div>
        `;
    }).join("");
    cartContainer.innerHTML = productsHTML;
}
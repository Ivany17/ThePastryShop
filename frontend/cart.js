//cart.js
const cartBtn = document.getElementById('cartBtn');
const cartContainer = document.getElementById('cart-container');
let cartData; // declare the variable outside so that all functions can use it.

cartBtn.addEventListener('click', () => {
    cartContainer.classList.toggle('openCart');
});

async function loadProductsInTheCart(){
    const getCartResponse = await fetch(`http://localhost:5160/api/cart`);
    cartData = await getCartResponse.json(); // convert the JSON into an object so that it can be used later.
}
//cart.js
const cartBtn = document.getElementById('cartBtn');
const cartContainer = document.getElementById('cart-container');

cartBtn.addEventListener('click', () => {
    cartContainer.classList.toggle('openCart');
});
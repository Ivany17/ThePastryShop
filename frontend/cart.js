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
    renderProductsInTheCart(cartData);
    findCheckbox();
}

function renderProductsInTheCart(cartData){
    if(cartData.length === 0){
        cartContainer.innerHTML = `The cart is empty`;
        return;
    }
    cartData.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)); // Convert the text into a date and sort the product cards from newest to oldest
    const productsHTML = cartData.map((cardInTheCart) => {
        const checkInTag = cardInTheCart.isSelected ? 'checked' : ''; // the `checked` attribute is used so that a checkbox appears with a checkmark.
        // Capitalize first letter in name and category for display only (data stays lowercase)
        return `
            <div class="product-card-in-the-cart">
                <input type="checkbox" class="checkedProductInTheCart" data-id="${cardInTheCart.productItem.id}" ${checkInTag}>
                <h3>${cardInTheCart.productItem.name.toLowerCase().split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')}</h3>
                <p>${cardInTheCart.productItem.category.toLowerCase().split(' ').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')}</p> 
                <p>${cardInTheCart.productItem.description}</p>
                <button class="minusBtn" data-id="${cardInTheCart.productItem.id}">-</button>
                <p>${cardInTheCart.quantity}</p>
                <button class="plusBtn" data-id="${cardInTheCart.productItem.id}">+</button>
                <p>${cardInTheCart.productItem.price * cardInTheCart.quantity} ₴</p>
            </div>
        `;
    }).join("");
    cartContainer.innerHTML = productsHTML;
}

function findCheckbox(){
    const checkedProductInTheCart = document.querySelectorAll(".checkedProductInTheCart");
    checkedProductInTheCart.forEach(checkbox => {
        checkbox.addEventListener('change', async () => { // 'change' is an event that triggers when a checkbox is checked or unchecked
            const checkedProduct = { // we store a true/false value in an object so that the server can work with it
                IsSelected: checkbox.checked, // IsSelected from class UpdateSelectedRequest in Program.cs
            }
            const putResponseChecked = await fetch(`http://localhost:5160/api/cart/${checkbox.dataset.id}/checkbox`, {
                method: 'PUT',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(checkedProduct),
            });
        });
    });
}
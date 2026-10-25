//cart.js
const cartBtn = document.getElementById('cartBtn');
const cartContainer = document.getElementById('cart-container');
const containerForTotalPrice = document.getElementById('containerForTotalPrice');
const containerForCards = document.getElementById('containerForCards');
let cartData; // declare the variable outside so that all functions can use it.
const buyBtn = document.getElementById('buyBtn');

cartBtn.addEventListener('click', () => {
    document.body.classList.toggle('openCartForBody');
    cartContainer.classList.toggle('openCart'); // add and remove a class with a single click using `toggle`.
    if(cartContainer.classList.contains('openCart')){ // if the class is added, load the product cards in the cart.
        loadProductsInTheCart();
    }
});

buyBtn.addEventListener('click', async () => {
    const deleteAllResponse = await fetch(`http://localhost:5160/api/cart/checked`, {
        method: 'DELETE',
    });
    loadProductsInTheCart();
    showToastMessage(`Your purchase is successful`);
});

async function loadProductsInTheCart(){
    const getCartResponse = await fetch(`http://localhost:5160/api/cart`);
    cartData = await getCartResponse.json(); // convert the JSON into an object so that it can be used later.
    const totalPrice = thePricesInTheCart(cartData);
    renderProductsInTheCart(cartData, totalPrice);
    const listOfSelectedCards = findTheSelectedCards(cartData);
    const totalPriceOfSelectedCards = thePricesInTheCart(listOfSelectedCards);
    findCheckbox();
    findDeleteBtn();
    findMinusAndPlusBtn('.minusBtn', -1);
    findMinusAndPlusBtn('.plusBtn', 1);
    buyBtn.textContent = `Buy for ${totalPriceOfSelectedCards} ₴`;
    buyBtn.disabled = (listOfSelectedCards.length === 0); // if no cards are selected, the condition becomes true, which makes the button inactive — since the `disabled` property itself relies on `true`/`false` conditions.
}

function renderProductsInTheCart(listOfCards, sumOfProductPrices){
    containerForTotalPrice.textContent = `Total price in the cart: ${sumOfProductPrices} ₴`;
    if(listOfCards.length === 0){
        containerForCards.innerHTML = `The cart is empty`;
        return;
    }
    listOfCards.sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)); // Convert the text into a date and sort the product cards from newest to oldest
    const productsHTML = listOfCards.map((cardInTheCart) => {
        const checkInTag = cardInTheCart.isSelected ? 'checked' : ''; // the `checked` attribute is used so that a checkbox appears with a checkmark.
        // Capitalize first letter in name and category for display only (data stays lowercase)
        return `
            <div class="product-card-in-the-cart">
                <input type="checkbox" class="checkedProductInTheCart" data-id="${cardInTheCart.productItem.id}" ${checkInTag}>
                <button class="deleteBtn" data-id="${cardInTheCart.productItem.id}" data-name="${cardInTheCart.productItem.name}">Delete</button>
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
    containerForCards.innerHTML = productsHTML;
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
            loadProductsInTheCart();
        });
    });
}

function findMinusAndPlusBtn(findBtn, changeInQuantity){
    const quantityBtns = document.querySelectorAll(findBtn);
    quantityBtns.forEach(button => {
        button.addEventListener('click', async () => {
            const cardWithQuantity = cartData.find(cart => cart.productItem.id === parseInt(button.dataset.id));
            const newQuantity = cardWithQuantity.quantity + changeInQuantity; // the variable holds the current quantity of the item plus change in quantity, without changing the quantity in the item card
            if(newQuantity < 1){ // the user should not be able to send a request to the server that would be rejected anyway
                return;
            }
            const changedQuantity = { // we store a number of quantity in an object so that the server can work with it
                UpdateQuantity: newQuantity, // UpdateQuantity from class UpdateQuantityRequest in Program.cs
            }
            const putResponseBtns = await fetch(`http://localhost:5160/api/cart/${button.dataset.id}`, {
                method: 'PUT',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify(changedQuantity),
            });
            loadProductsInTheCart(); // a function that will load new product cards, read the cart and draw the cards. This call goes after the fetch, because the card is already saved on the server
        });
    });
}

function findDeleteBtn(){
    const deleteBtn = document.querySelectorAll('.deleteBtn');
    deleteBtn.forEach(delBtn => {
        delBtn.addEventListener('click', async () => {
            if(!confirm(`Do you really want to delete ${delBtn.dataset.name} from your cart?`)){
                return
            } else {
                const deleteResponse = await fetch(`http://localhost:5160/api/cart/${delBtn.dataset.id}`, {
                    method: 'DELETE',
                });
            }
            loadProductsInTheCart();
        });
    });
}

function thePricesInTheCart(cardsInTheCart){
    const sumOfCardPrices = cardsInTheCart.reduce((acc, n) => {return acc + n.productItem.price * n.quantity}, 0);
    return sumOfCardPrices;
}

function findTheSelectedCards(cardsForSelect){
    const selectedCard = cardsForSelect.filter(card => card.isSelected);
    return selectedCard;
}
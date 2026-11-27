//cart.js
import { // Thanks to imports, the file can access the functions and variables from `shared.js`. The import line immediately reveals the file's dependencies.
    serverAddress,
    somethingWentWrongPhrase,
    showToastMessage,
    capitalizeEachWord,
    showPriceWithTwoDecimalPlaces,
    showErrorMessage,
    safeHTMLcodes,
    getButtonId
} from './shared.js';

const cartContainer = document.getElementById('cart-container');
const containerForTotalPrice = document.getElementById('containerForTotalPrice');
const containerForCards = document.getElementById('containerForCards');
let cartData; // Declare the variable outside so that all functions can use it.
const buyBtn = document.getElementById('buyBtn');

// This function looks for the `cartBtn` and attaches a click handler to it that opens the cart. It is called only after the `cartBtn` is created, because otherwise `getElementById` would have returned `null`.
export function launchTheCart(){
    const cartBtn = document.getElementById('cartBtn');
    cartBtn.addEventListener('click', () => {
        document.body.classList.toggle('openCartForBody');
        cartContainer.classList.toggle('openCart'); // Add and remove a class with a single click using `toggle`.
        if(cartContainer.classList.contains('openCart')){ // If the class is added, load the product cards in the cart.
            loadProductsInTheCart();
        }
    });
}

function findTheCardById(button){
    const buttonId = getButtonId(button);
    return cartData.find(cardInTheCart => cardInTheCart.productItem.id === buttonId);
}

async function changeProductQuantity(quantityBtn){
    const cardWithQuantity = findTheCardById(quantityBtn);
    if(cardWithQuantity === undefined){ // If `cardWithQuantity` is not found in the list, the function returns before reaching the request, to avoid working with `undefined`.
        return;
    }
    const changeInQuantity = quantityBtn.classList.contains('plusBtn') ? 1 : -1;
    const newQuantity = cardWithQuantity.quantity + changeInQuantity; // The variable holds the current quantity of the item plus change in quantity, without changing the quantity in the item card.
    const changedQuantity = { // We store a number of quantity in an object so that the server can work with it.
        UpdateQuantity: newQuantity, // UpdateQuantity from class UpdateQuantityRequest in Program.cs.
    };
    quantityBtn.disabled = true; // Disables the button to prevent sending new requests before the previous one has been processed.
    try {
        const putResponseBtn = await fetch(`${serverAddress}/api/cart/${quantityBtn.dataset.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(changedQuantity),
        });
        await loadProductsInTheCart(); // `changeProductQuantity` waits for the cart to load and re-render, ensuring that the error message `somethingWentWrongPhrase` appears only after that.
        if(!putResponseBtn.ok){
            showErrorMessage(somethingWentWrongPhrase, `Failed to change the quantity of the item in the cart. The server returned an error with ${putResponseBtn.status}`);
        }
    } catch (error){
        showErrorMessage(somethingWentWrongPhrase, error);
        quantityBtn.disabled = false; // Enable the button if the server fails to respond and the cart is not re-rendered, allowing the user to retry without reloading the page.
    }
}

async function deleteProductFromTheCart(deleteBtn){
    const cardToDelete = findTheCardById(deleteBtn);
    if(cardToDelete === undefined){
        return;
    }
    const nameOfTheProduct = capitalizeEachWord(cardToDelete.productItem.name);
    if(!confirm(`Do you really want to delete ${nameOfTheProduct} from your cart?`)){
        return;
    }
    deleteBtn.disabled = true;
    try {
        const deleteResponse = await fetch(`${serverAddress}/api/cart/${deleteBtn.dataset.id}`, {
            method: 'DELETE',
        });
        loadProductsInTheCart();
        if(deleteResponse.ok){
            showToastMessage(`${nameOfTheProduct} deleted successfully`);
        } else {
            showErrorMessage(`${nameOfTheProduct} was not deleted from the cart`, `Failed to remove the item from the cart. The server returned an error with ${deleteResponse.status}`);
        }
    } catch (error){
        showErrorMessage(somethingWentWrongPhrase, error);
        deleteBtn.disabled = false;
    }
}

containerForCards.addEventListener('click', (event) => { // A single handler on the container—since the click event bubbles up from the button—means there's no need to reattach handlers to the buttons every time the cards are re-rendered.
    const deleteBtn = event.target.closest('.deleteBtn');
    const quantityBtn = event.target.closest('.minusBtn, .plusBtn');
    if(deleteBtn){
        deleteProductFromTheCart(deleteBtn);
    } else if(quantityBtn){
        changeProductQuantity(quantityBtn);
    }
});

containerForCards.addEventListener('change', async (event) => { // 'change' is an event that triggers when a checkbox is checked or unchecked.
    const checkedCheckboxInTheCart = event.target.closest('.checkedProductInTheCart');
    if(checkedCheckboxInTheCart === null){
        return;
    }
    const checkboxStateObject = { // We store a true/false value in an object so that the server can work with it.
        IsSelected: checkedCheckboxInTheCart.checked, // IsSelected from class UpdateSelectedRequest in Program.cs.
    };
    try {
        const putResponseChecked = await fetch(`${serverAddress}/api/cart/${checkedCheckboxInTheCart.dataset.id}/checkbox`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(checkboxStateObject),
        });
        if(!putResponseChecked.ok){
            showErrorMessage(somethingWentWrongPhrase, `Failed to change the checkbox state in the cart. The server returned an error with ${putResponseChecked.status}`);
        }
    } catch (error){
        showErrorMessage(somethingWentWrongPhrase, error);
    }
    loadProductsInTheCart(); // Placed after try/catch so it always runs: the browser toggles the checkbox itself before the server replies, so the cart must be redrawn from the server data even if the request failed.
});

buyBtn.addEventListener('click', async () => {
    buyBtn.disabled = true;
    try {
        const deleteSelectedResponse = await fetch(`${serverAddress}/api/cart/checked`, {
            method: 'DELETE',
        });
        loadProductsInTheCart();
        if(deleteSelectedResponse.ok){
            showToastMessage('Your purchase is successful');
        } else {
            showErrorMessage(somethingWentWrongPhrase, `Failed to complete the purchase. The server returned an error with ${deleteSelectedResponse.status}`);
        }
    } catch (error){
        showErrorMessage(somethingWentWrongPhrase, error);
        buyBtn.disabled = false;
    }
});

const errorLoadingCartMessage = `We couldn't load the cart. Please try again later.`;
export async function loadProductsInTheCart(){
    try {
        const getCartResponse = await fetch(`${serverAddress}/api/cart`);
        if(!getCartResponse.ok){ // Catch only handles an unreachable server, so a server error response is stopped here before it is read as a list.
            renderCartAfterLoadingError();
            console.error(`Failed to load the cart. The server returned an error with ${getCartResponse.status}`);
            return;
        }
        cartData = await getCartResponse.json(); // Convert the JSON into an object so that it can be used later.
        const totalPrice = sumThePricesInTheCart(cartData);
        renderProductsInTheCart(cartData, totalPrice);
        const listOfSelectedCards = findTheSelectedCards(cartData);
        const totalPriceOfSelectedCards = sumThePricesInTheCart(listOfSelectedCards);
        buyBtn.textContent = `Buy for ${showPriceWithTwoDecimalPlaces(totalPriceOfSelectedCards)} ₴`;
        buyBtn.disabled = (listOfSelectedCards.length === 0); // If no cards are selected, the condition becomes true, which makes the button inactive — since the `disabled` property itself relies on `true`/`false` conditions.
    } catch (error){
        renderCartAfterLoadingError();
        console.error(error);
    }
}

function renderCartAfterLoadingError(){
    buyBtn.disabled = true;
    buyBtn.textContent = 'Buy';
    containerForCards.innerHTML = errorLoadingCartMessage;
    containerForTotalPrice.textContent = '';
}

function renderProductsInTheCart(listOfCards, sumOfProductPrices){
    containerForTotalPrice.textContent = `Total price in the cart: ${showPriceWithTwoDecimalPlaces(sumOfProductPrices)} ₴`;
    if(listOfCards.length === 0){
        containerForCards.innerHTML = 'The cart is empty';
        return;
    }
    const sortedCopyOfCards = [...listOfCards].sort((firstCard, secondCard) => new Date(secondCard.addedAt) - new Date(firstCard.addedAt)); // Sorts a copy, not the original list, so that drawing the cart does not change the order of cartData; the text is converted into a date to sort from newest to oldest.
    const productsHTML = sortedCopyOfCards.map((cardInTheCart) => {
        const productInTheCard = cardInTheCart.productItem;
        const nameOfProductForHTML = safeHTMLcodes(capitalizeEachWord(productInTheCard.name));
        const idOfTheProduct = productInTheCard.id;
        const checkInTag = cardInTheCart.isSelected ? 'checked' : ''; // The `checked` attribute is used so that a checkbox appears with a checkmark.
        const disabledInTag = cardInTheCart.quantity === 1 ? 'disabled' : ''; // The `disabled` attribute is added to the minus button at quantity 1, so a request that the server would reject (quantity below 1) is never sent.
        // Capitalize first letter in every word in name and category for display only (data doesn't change).
        // The checkbox is wrapped in a `label` and the plus, minus and Delete buttons have an `aria-label`, so that a screen reader can announce which product each of them belongs to.
        return `
            <div class="product-card-in-the-cart">
                <label>
                    <input type="checkbox" class="checkedProductInTheCart" data-id="${idOfTheProduct}" ${checkInTag}> Select ${nameOfProductForHTML} for purchase
                </label>
                <button class="deleteBtn" data-id="${idOfTheProduct}" aria-label="Delete ${nameOfProductForHTML} from the cart">Delete</button>
                <h3>${nameOfProductForHTML}</h3>
                <p>${safeHTMLcodes(capitalizeEachWord(productInTheCard.category))}</p>
                <p>${safeHTMLcodes(productInTheCard.description)}</p>
                <button class="minusBtn" data-id="${idOfTheProduct}" aria-label="Decrease quantity of ${nameOfProductForHTML}" ${disabledInTag}>-</button>
                <p>${cardInTheCart.quantity}</p>
                <button class="plusBtn" data-id="${idOfTheProduct}" aria-label="Increase quantity of ${nameOfProductForHTML}">+</button>
                <p>${showPriceWithTwoDecimalPlaces(productInTheCard.price * cardInTheCart.quantity)} ₴</p>
            </div>
        `;
    }).join('');
    containerForCards.innerHTML = productsHTML;
}

function sumThePricesInTheCart(cardsInTheCart){
    return cardsInTheCart.reduce((sumOfPrices, card) => {return sumOfPrices + card.productItem.price * card.quantity;}, 0);
}

function findTheSelectedCards(cardsInTheCart){
    return cardsInTheCart.filter(card => card.isSelected);
}
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
    try {
        const deleteAllResponse = await fetch('http://localhost:5160/api/cart/checked', {
            method: 'DELETE',
        });
        loadProductsInTheCart();
        if(deleteAllResponse.ok){
            showToastMessage('Your purchase is successful');
        } else {
            showToastMessage(somethingWentWrongPhrase);
            console.error(`Failed to complete the purchase. The server returned an error with ${deleteAllResponse.status}`);
        }
    } catch (error){
        showToastMessage(somethingWentWrongPhrase);
        console.error(error);
    }
});

const errorLoadingCartMessage = `We couldn't load the cart. Please try again later.`;
async function loadProductsInTheCart(){
    try {
        const getCartResponse = await fetch('http://localhost:5160/api/cart');
        if(!getCartResponse.ok){ // catch only handles an unreachable server, so a server error response is stopped here before it is read as a list.
            buyBtn.disabled = true;
            containerForCards.innerHTML = errorLoadingCartMessage;
            console.error(`Failed to load the cart. The server returned an error with ${getCartResponse.status}`);
            return;
        }
        cartData = await getCartResponse.json(); // convert the JSON into an object so that it can be used later.
        const totalPrice = thePricesInTheCart(cartData);
        renderProductsInTheCart(cartData, totalPrice);
        const listOfSelectedCards = findTheSelectedCards(cartData);
        const totalPriceOfSelectedCards = thePricesInTheCart(listOfSelectedCards);
        findCheckbox();
        findDeleteBtn();
        findMinusAndPlusBtn('.minusBtn', -1);
        findMinusAndPlusBtn('.plusBtn', 1);
        buyBtn.textContent = `Buy for ${showPriceWithTwoDecimalPlaces(totalPriceOfSelectedCards)} ₴`;
        buyBtn.disabled = (listOfSelectedCards.length === 0); // if no cards are selected, the condition becomes true, which makes the button inactive — since the `disabled` property itself relies on `true`/`false` conditions.
    } catch (error){
        buyBtn.disabled = true;
        containerForCards.innerHTML = errorLoadingCartMessage;
        console.error(error);
    }
}

function renderProductsInTheCart(listOfCards, sumOfProductPrices){
    containerForTotalPrice.textContent = `Total price in the cart: ${showPriceWithTwoDecimalPlaces(sumOfProductPrices)} ₴`;
    if(listOfCards.length === 0){
        containerForCards.innerHTML = 'The cart is empty';
        return;
    }
    const sortedCopyOfCards = [...listOfCards].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt)); // sorts a copy, not the original list, so that drawing the cart does not change the order of cartData; the text is converted into a date to sort from newest to oldest.
    const productsHTML = sortedCopyOfCards.map((cardInTheCart) => {
        const checkInTag = cardInTheCart.isSelected ? 'checked' : ''; // the `checked` attribute is used so that a checkbox appears with a checkmark.
        // Capitalize first letter in every word in name and category for display only (data doesn't change).
        return `
            <div class="product-card-in-the-cart">
                <input type="checkbox" class="checkedProductInTheCart" data-id="${cardInTheCart.productItem.id}" ${checkInTag}>
                <button class="deleteBtn" data-id="${cardInTheCart.productItem.id}">Delete</button>
                <h3>${safeHTMLcodes(capitalizeEachWord(cardInTheCart.productItem.name))}</h3>
                <p>${safeHTMLcodes(capitalizeEachWord(cardInTheCart.productItem.category))}</p>
                <p>${safeHTMLcodes(cardInTheCart.productItem.description)}</p>
                <button class="minusBtn" data-id="${cardInTheCart.productItem.id}">-</button>
                <p>${cardInTheCart.quantity}</p>
                <button class="plusBtn" data-id="${cardInTheCart.productItem.id}">+</button>
                <p>${showPriceWithTwoDecimalPlaces(cardInTheCart.productItem.price * cardInTheCart.quantity)} ₴</p>
            </div>
        `;
    }).join('');
    containerForCards.innerHTML = productsHTML;
}

function findCheckbox(){
    const checkedProductInTheCart = document.querySelectorAll('.checkedProductInTheCart');
    checkedProductInTheCart.forEach(checkbox => {
        checkbox.addEventListener('change', async () => { // 'change' is an event that triggers when a checkbox is checked or unchecked.
            const checkedProduct = { // we store a true/false value in an object so that the server can work with it.
                IsSelected: checkbox.checked, // IsSelected from class UpdateSelectedRequest in Program.cs.
            };
            try {
                const putResponseChecked = await fetch(`http://localhost:5160/api/cart/${checkbox.dataset.id}/checkbox`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(checkedProduct),
                });
                if(!putResponseChecked.ok){
                    showToastMessage(somethingWentWrongPhrase);
                    console.error(`Failed to change the checkbox state in the cart. The server returned an error with ${putResponseChecked.status}`);
                }
            } catch (error){
                showToastMessage(somethingWentWrongPhrase);
                console.error(error);
            }
            loadProductsInTheCart(); // placed after try/catch so it always runs: the browser toggles the checkbox itself before the server replies, so the cart must be redrawn from the server data even if the request failed.
        });
    });
}

function findMinusAndPlusBtn(findBtn, changeInQuantity){
    const quantityBtns = document.querySelectorAll(findBtn);
    quantityBtns.forEach(button => {
        button.addEventListener('click', async () => {
            const cardWithQuantity = cartData.find(cardInTheCart => cardInTheCart.productItem.id === parseInt(button.dataset.id, 10));
            const newQuantity = cardWithQuantity.quantity + changeInQuantity; // the variable holds the current quantity of the item plus change in quantity, without changing the quantity in the item card.
            if(newQuantity < 1){ // the user should not be able to send a request to the server that would be rejected anyway.
                return;
            }
            const changedQuantity = { // we store a number of quantity in an object so that the server can work with it.
                UpdateQuantity: newQuantity, // UpdateQuantity from class UpdateQuantityRequest in Program.cs.
            };
            button.disabled = true;
            try {
                const putResponseBtns = await fetch(`http://localhost:5160/api/cart/${button.dataset.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(changedQuantity),
                });
                await loadProductsInTheCart(); // The click handler waits for the function to update the cart data, so that the next click works with the updated cart data.
                if(!putResponseBtns.ok){
                    showToastMessage(somethingWentWrongPhrase);
                    console.error(`Failed to change the quantity of the item in the cart. The server returned an error with ${putResponseBtns.status}`);
                }
            } catch (error){
                showToastMessage(somethingWentWrongPhrase);
                console.error(error);
                button.disabled = false; // Enable the button if the server fails to respond and the cart does not re-render, allowing the user to retry without reloading the page.
            }
        });
    });
}

function findDeleteBtn(){
    const deleteBtn = document.querySelectorAll('.deleteBtn');
    deleteBtn.forEach(delBtn => {
        delBtn.addEventListener('click', async () => {
            const deletedCart = cartData.find(cardInTheCart => cardInTheCart.productItem.id === parseInt(delBtn.dataset.id, 10));
            if(!confirm(`Do you really want to delete ${capitalizeEachWord(deletedCart.productItem.name)} from your cart?`)){
                return;
            }
            try {
                const deleteResponse = await fetch(`http://localhost:5160/api/cart/${delBtn.dataset.id}`, {
                    method: 'DELETE',
                });
                loadProductsInTheCart();
                if(deleteResponse.ok){
                    showToastMessage(`${capitalizeEachWord(deletedCart.productItem.name)} deleted successfully`);
                } else {
                    showToastMessage(`${capitalizeEachWord(deletedCart.productItem.name)} was not deleted from the cart`);
                    console.error(`Failed to remove the item from the cart. The server returned an error with ${deleteResponse.status}`);
                }
            } catch (error){
                showToastMessage(somethingWentWrongPhrase);
                console.error(error);
            }
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
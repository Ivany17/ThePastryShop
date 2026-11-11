//shared.js
function renderHeader(page) {
    const header = document.getElementById('header-container');
    switch (page) {
        case 'welcome':
            header.innerHTML = logoHTML;
            header.innerHTML += navHTML;
            break;
        case 'shop':
            header.innerHTML = logoHTML;
            header.innerHTML += `<input type="text" id="searchProducts">`;
            header.innerHTML += navHTML;
            header.innerHTML += `<button id="cartBtn">🛒</button>`;
            break;
        case 'admin':
            header.innerHTML = logoHTML;
            header.innerHTML += `<input type="text" id="searchProducts">`;
            header.innerHTML += navHTML;
            header.innerHTML += `<a href="shop.html">To Shop</a>`;
            break;
        default:
            console.log('Wrong page');
    }
}

const logoHTML = `<a href="index.html">
        <h2>Charodiya</h2>
    </a>`;

const navHTML = `<nav>
        <button id="headerAllBtn">All</button>
        <button id="headerCakesBtn">Cakes</button>
        <button id="headerPastriesBtn">Pastries</button>
        <button id="headerCookiesBtn">Cookies</button>
    </nav>`;

const somethingWentWrongPhrase = 'Something went wrong. Please try again';

function renderFooter(page) {
    const footer = document.getElementById('footer-container');
    // these three lines are the same for three files.
    footer.innerHTML = logoHTML;
    footer.innerHTML += addressHTML;
    footer.innerHTML += copyrightHTML;
    switch (page) {
        // remove "break" from "welcome" because it has the same code with "shop".
        case 'welcome':
        case 'shop':
            footer.innerHTML += `<a href="admin.html">To Admin</a>`;
            break;
        case 'admin':
            break;
        default:
            console.log('Wrong page');
    }
}

const addressHTML = `<address>
        <p>Osvita street, 35</p>
        <p>+380 95 768 09 33</p>
        <p>8 am - 5 pm</p>
    </address>`;

const copyrightHTML = `<p>&copy; Charodiya, 2026</p>`;

function showToastMessage(textMessage) {
    const toastContainer = document.getElementById('toastContainer');
    const toastMessage = document.createElement('p'); // create a new html element and saving it into the memory.
    toastMessage.textContent = textMessage;
    toastContainer.append(toastMessage); // add new element to the block and show it.
    setTimeout(() => toastMessage.remove(), 3000); // an arrow function is needed to delete an element in 3 seconds, rather than immediately.
}

function capitalizeEachWord(phrase) {
    // make the first letter uppercase, and all other letters in the word lowercase.
    return phrase
        .toLowerCase()
        .trim() // trim() that removes extra spaces before and after a text should be used before the phrase is split; otherwise, these extra spaces will cause the code to fail.
        .split(/\s+/) // a regular expression (regex) pattern that treats one or more spaces within a phrase as a single separator; otherwise, these extra spaces inside a phrase will cause the code to fail.
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '); // If the string is empty, `word.charAt(0)` returns an empty string, on which `toUpperCase()` can be used, unlike word[0], which would break the code.
}

function removeExtraSpaces(phrase) {
    return phrase.trim().replace(/\s+/g, ' '); // Remove extra spaces in the middle using .replace and at the beginning and at the end of a phrase using trim(), to prevent data containing extra spaces from reaching the server.
}

function hasTheFormEmptyFields(filledForm) {
    return filledForm.Name.length === 0 || filledForm.Description.length === 0 || Number.isNaN(filledForm.Price) || filledForm.Price <= 0;
}

// Returns a price as text for display only, so that every price in the project looks the same and the format can be changed in one place.
function showPriceWithTwoDecimalPlaces(price){
    return price.toFixed(2); // rounds the number to remove floating-point "tails" like 299.96999999999997, and returns text with exactly two digits after the decimal point.
}

// This block replaces dangerous characters with safe ones before they reach `innerHTML`, ensuring the text is displayed as plain text.
// The replacement for the ampersand (&) must come first, because the safe codes for other characters also contain an ampersand.
function replaceAmpersand(text){
    return text.replaceAll('&', '&amp;');
}

function replaceLeftAngleBracket(text){
    return text.replaceAll('<', '&lt;');
}

function replaceRightAngleBracket(text){
    return text.replaceAll('>', '&gt;');
}

function replaceDoubleQuote(text){
    return text.replaceAll('"', '&quot;');
}

function replaceSingleQuote(text){
    return text.replaceAll(`'`, '&#39;');
}

// A function that combines the five escape functions into a chain and invokes them in the correct order to escape text before inserting it into innerHTML.
function safeHTMLcodes(text){
    const ampersand = replaceAmpersand(text);
    const leftAngleBracket = replaceLeftAngleBracket(ampersand);
    const rightAngleBracket = replaceRightAngleBracket(leftAngleBracket);
    const doubleQuote = replaceDoubleQuote(rightAngleBracket);
    const singleQuote = replaceSingleQuote(doubleQuote);
    return singleQuote;
}
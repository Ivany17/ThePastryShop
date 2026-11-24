//shared.js
export const serverAddress = 'http://localhost:5160';

export const somethingWentWrongPhrase = 'Something went wrong. Please try again';

const logoHTML = `<a href="index.html">
        <h2>Charodiya</h2>
    </a>`;

const navHTML = `<nav>
        <button id="headerAllBtn">All</button>
        <button id="headerCakesBtn">Cakes</button>
        <button id="headerPastriesBtn">Pastries</button>
        <button id="headerCookiesBtn">Cookies</button>
    </nav>`;

const addressHTML = `<address>
        <p>Osvita street, 35</p>
        <p>+380 95 768 09 33</p>
        <p>8 am - 5 pm</p>
    </address>`;

const copyrightHTML = '<p>&copy; Charodiya, 2026</p>';

export function renderHeader(page){ // With export, a file can make functions and variables accessible so that other files can use them. Without export, everything remains inside the file.
    const header = document.getElementById('header-container');
    let headerHTML = logoHTML;
    switch(page){
        case 'welcome':
            headerHTML += navHTML;
            break;
        case 'shop':
            headerHTML += '<input type="text" id="searchProducts">';
            headerHTML += navHTML;
            headerHTML += '<button id="cartBtn">🛒</button>';
            break;
        case 'admin':
            headerHTML += '<input type="text" id="searchProducts">';
            headerHTML += navHTML;
            headerHTML += '<a href="shop.html">To Shop</a>';
            break;
        default:
            console.error('Wrong page');
    }
    header.innerHTML = headerHTML;
}

export function renderFooter(page){
    const footer = document.getElementById('footer-container');
    let footerHTML = logoHTML;
    footerHTML += addressHTML;
    footerHTML += copyrightHTML;
    switch(page){
        case 'welcome': // remove "break" from "welcome" because it has the same code with "shop".
        case 'shop':
            footerHTML += '<a href="admin.html">To Admin</a>';
            break;
        case 'admin':
            break;
        default:
            console.error('Wrong page');
    }
    footer.innerHTML = footerHTML;
}

export function findProductById(listOfProducts, button){
    return listOfProducts.find(list => list.id === parseInt(button.dataset.id, 10)); // To prevent parseInt from having to guess the number system, the number 10 after the comma indicates that this is definitely a decimal number.
}

export function showToastMessage(textMessage){
    const toastContainer = document.getElementById('toastContainer');
    const toastMessage = document.createElement('p'); // create a new html element and saving it into the memory.
    toastMessage.textContent = textMessage;
    toastContainer.append(toastMessage); // add new element to the block and show it.
    setTimeout(() => toastMessage.remove(), 3000); // an arrow function is needed to delete an element in 3 seconds, rather than immediately.
}

// make the first letter uppercase, and all other letters in the word lowercase.
export function capitalizeEachWord(phrase){
    return phrase
        .toLowerCase()
        .trim() // trim() that removes extra spaces before and after a text should be used before the phrase is split; otherwise, these extra spaces will cause the code to fail.
        .split(/\s+/) // a regular expression (regex) pattern that treats one or more spaces within a phrase as a single separator; otherwise, these extra spaces inside a phrase will cause the code to fail.
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' '); // If the string is empty, `word.charAt(0)` returns an empty string, on which `toUpperCase()` can be used, unlike word[0], which would break the code.
}

export function removeExtraSpaces(phrase){
    return phrase.trim().replace(/\s+/g, ' '); // Remove extra spaces in the middle using .replace and at the beginning and at the end of a phrase using trim(), to prevent data containing extra spaces from reaching the server.
}

export function hasTheFormEmptyFields(filledForm){
    return filledForm.Name.length === 0 || filledForm.Description.length === 0 || Number.isNaN(filledForm.Price) || filledForm.Price <= 0;
}

// Returns a price as text for display only, so that every price in the project looks the same and the format can be changed in one place.
export function showPriceWithTwoDecimalPlaces(price){
    return price.toFixed(2); // rounds the number to remove floating-point "tails" like 299.96999999999997, and returns text with exactly two digits after the decimal point.
}

export function showErrorMessage(toastErrorMsg, consoleErrorMsg){
    showToastMessage(toastErrorMsg);
    console.error(consoleErrorMsg);
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
export function safeHTMLcodes(text){
    const ampersand = replaceAmpersand(text);
    const leftAngleBracket = replaceLeftAngleBracket(ampersand);
    const rightAngleBracket = replaceRightAngleBracket(leftAngleBracket);
    const doubleQuote = replaceDoubleQuote(rightAngleBracket);
    const singleQuote = replaceSingleQuote(doubleQuote);
    return singleQuote;
}
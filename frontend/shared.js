//shared.js
function renderHeader(page){
    const header = document.getElementById('header-container');
    switch (page) {
        case "welcome":
            header.innerHTML = logoHTML;
            header.innerHTML += navHTML;
            break;
        case "shop":
            header.innerHTML = logoHTML;
            header.innerHTML += `<input type="text" id="searchProducts">`;
            header.innerHTML += navHTML;
            header.innerHTML += `<button id="cartBtn">🛒</button>`;
            break;
        case "admin":
            header.innerHTML = logoHTML;
            header.innerHTML += `<input type="text" id="searchProducts">`;
            header.innerHTML += navHTML;
            header.innerHTML += `<a href="shop.html">To Shop</a>`;
            break;
        default:
            console.log("Wrong page");
    }
}

const logoHTML = 
    `<a href="index.html">
        <h2>Charodiya</h2>
    </a>`

const navHTML = 
    `<nav>
        <button id="headerAllBtn">All</button>
        <button id="headerCakesBtn">Cakes</button>
        <button id="headerPasteriesBtn">Pasteries</button>
        <button id="headerCookiesBtn">Cookies</button>
    </nav>`

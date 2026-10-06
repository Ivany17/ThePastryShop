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
        <button id="headerPastriesBtn">Pastries</button>
        <button id="headerCookiesBtn">Cookies</button>
    </nav>`

function renderFooter(page){
    const footer = document.getElementById('footer-container');
    switch (page) {
        case "welcome":
            footer.innerHTML = logoHTML;
            break;
        case "shop":
            console.log('Here is the shop-page');
            break;
        case "admin":
            console.log('Here is the admin-page');
            break;
        default:
            console.log("Wrong page");
    }
}

const addressHTML = 
    `<address>
        <p>Osvita street, 35</p>
        <p>+(380)957680933</p>
        <p>8 am - 5 pm</p>
    </address>`

const copyrightHTML =
    `<p>&copy; Charodiya, 2026</p>`
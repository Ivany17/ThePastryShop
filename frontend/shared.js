//shared.js
function renderHeader(page){
    const header = document.getElementById('header-container');
    header.innerHTML = commonHeaderHTML;
    switch (page) {
        case "welcome":

            break;
        case "shop":

            break;
        case "admin":

            break;
        default:
            console.log("Wrong page");
    }
}

const commonHeaderHTML =
    `<header>
        <a href="index.html">
            <h2>Charodiya</h2>
        </a>
        <nav>
            <button id="headerAllBtn">All</button>
            <button id="headerCakesBtn">Cakes</button>
            <button id="headerPasteriesBtn">Pasteries</button>
            <button id="headerCookiesBtn">Cookies</button>
        </nav>
    </header>`

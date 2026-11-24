//app.js
import { renderHeader, renderFooter } from './shared.js'; // Thanks to imports, the file can access the functions from `shared.js`. The import line immediately reveals the file's dependencies.

renderHeader("welcome");
renderFooter("welcome");

const headerAllBtn = document.getElementById('headerAllBtn');
headerAllBtn.addEventListener('click', () => {
    window.location.href = "shop.html";
});

const headerCakesBtn = document.getElementById('headerCakesBtn');
headerCakesBtn.addEventListener('click', () => {
    window.location.href = "shop.html?category=cake";
});

const headerPastriesBtn = document.getElementById('headerPastriesBtn');
headerPastriesBtn.addEventListener('click', () => {
    window.location.href = "shop.html?category=pastry";
});

const headerCookiesBtn = document.getElementById('headerCookiesBtn');
headerCookiesBtn.addEventListener('click', () => {
    window.location.href = "shop.html?category=cookie";
});
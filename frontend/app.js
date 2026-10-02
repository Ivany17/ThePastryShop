//app.js
renderHeader("welcome");

const headerCakesBtn = document.getElementById('headerCakesBtn');
headerCakesBtn.addEventListener('click', () => {
    window.location.href = "shop.html?category=cake";
});

const headerPasteriesBtn = document.getElementById('headerPasteriesBtn');
headerPasteriesBtn.addEventListener('click', () => {
    window.location.href = "shop.html?category=pastry";
});

const headerCookiesBtn = document.getElementById('headerCookiesBtn');
headerCookiesBtn.addEventListener('click', () => {
    window.location.href = "shop.html?category=cookie";
});
//app.js
renderHeader("welcome");

const headerCakesBtn = document.getElementById('headerCakesBtn');
headerCakesBtn.addEventListener('click', () => {
    window.location.href = "shop.html?category=cake";
});

const headerPasteriesBtn = document.getElementById('headerPasteriesBtn');
headerCakesBtn.addEventListener('click', () => {
    window.location.href = "shop.html?category=pastry";
});

const headerCookiesBtn = document.getElementById('headerCookiesBtn');
headerCakesBtn.addEventListener('click', () => {
    window.location.href = "shop.html?category=cookie";
});
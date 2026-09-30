//app.js
renderHeader("welcome");

const headerCakesBtn = document.getElementById('headerCakesBtn');
headerCakesBtn.addEventListener('click', () => {
    window.location.href = "shop.html?category=cake";
});
const productsContainer = document.getElementById('products-container');

async function loadProducts() {
    const getResponse = await fetch("http://localhost:5160/api/products");
    const data = await getResponse.json();
    console.log(data);
}

loadProducts();

let arr = [1, 2, 3];
let newArr = arr.map(n => n * 2);
console.log(newArr);
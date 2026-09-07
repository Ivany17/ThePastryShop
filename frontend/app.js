async function loadProducts() {
    const getResponse = await fetch("http://localhost:5160/api/products");
    const data = await getResponse.json();
    console.log(data);
}
//Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<AppDbContext>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://127.0.0.1:5500");
        policy.AllowAnyMethod();
        policy.AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");

app.UseHttpsRedirection();

List<ProductCardInTheCart> cart = new List<ProductCardInTheCart> { };

app.MapGet("/api/products", (AppDbContext dbContext) => Results.Ok(dbContext.Products));

app.MapGet("/api/products/{id}", (AppDbContext dbContext, int id) =>
{
    var getOneProduct = dbContext.Products.FirstOrDefault(p => p.Id == id);
    if (getOneProduct != null)
    {
        return Results.Ok(getOneProduct);
    }
    return Results.NotFound();
});

app.MapPost("/api/products", async (AppDbContext dbContext, ProductFromBody productFromBody) =>
{
    var newProduct = new Product
    {
        Category = productFromBody.Category,
        Name = productFromBody.Name,
        PhotoLinks = productFromBody.PhotoLinks,
        Description = productFromBody.Description,
        Price = productFromBody.Price,
    };
    dbContext.Products.Add(newProduct);
    await dbContext.SaveChangesAsync(); //to save the changes, that accumulate in memory, into the database
    return Results.Ok(newProduct);
});

app.MapDelete("/api/products/{id}", async (AppDbContext dbContext, int id) =>
{
    var deleteOneProduct = dbContext.Products.FirstOrDefault(p => p.Id == id);
    if (deleteOneProduct != null)
    {
        dbContext.Products.Remove(deleteOneProduct);
        await dbContext.SaveChangesAsync();
        return Results.Ok(deleteOneProduct);
    }
    return Results.NotFound();
});

app.MapPut("/api/products/{id}", async (AppDbContext dbContext, int id, ProductFromBody productFromBody) =>
{
    var editOneProduct = dbContext.Products.FirstOrDefault(p => p.Id == id);
    if (editOneProduct != null)
    {
        editOneProduct.Name = productFromBody.Name;
        editOneProduct.Category = productFromBody.Category;
        editOneProduct.Description = productFromBody.Description;
        editOneProduct.Price = productFromBody.Price;
        editOneProduct.PhotoLinks = productFromBody.PhotoLinks;
        await dbContext.SaveChangesAsync();
        return Results.Ok(editOneProduct);
    }
    return Results.NotFound();
});

app.MapGet("/api/cart", () => Results.Ok(cart));

app.MapPost("/api/cart/{id}", (AppDbContext dbContext, int id) =>
{
    var productFromTheDatabase = dbContext.Products.FirstOrDefault(p => p.Id == id);
    if (productFromTheDatabase != null)
    {
        var productCardInTheCart = cart.FirstOrDefault(cartItem => cartItem.ProductItem?.Id == id);
        if (productCardInTheCart != null)
        {
            productCardInTheCart.Quantity++;
        }
        else
        {
            productCardInTheCart = new ProductCardInTheCart // so that the variable after the if/else always contains a card, not null
            {
                ProductItem = productFromTheDatabase,
                Quantity = 1,
                AddedAt = DateTime.Now,
                IsSelected = false,
            };
            cart.Add(productCardInTheCart); // the product is now in the cart, but not in the database, so SaveChangesAsync() is not needed
        }
        return Results.Ok(productCardInTheCart);
    }
    return Results.NotFound();
});

app.MapPut("/api/cart/{id}", (int id, UpdateQuantityRequest quantityRequest) => // change the quantity of items in the cart
{
    var updateCardInTheCart = cart.FirstOrDefault(cartItem => cartItem.ProductItem?.Id == id);
    if (updateCardInTheCart != null)
    {
        if (quantityRequest.UpdateQuantity < 1)
        {
            return Results.BadRequest("Quantity must be at least 1");
        }

        updateCardInTheCart.Quantity = quantityRequest.UpdateQuantity;
        return Results.Ok(updateCardInTheCart);
    }
    return Results.NotFound();
});

app.MapPut("/api/cart/{id}/checkbox", (int id, UpdateSelectedRequest selectedRequest) => // selected product card checkbox in the cart
{
    var selectCardInTheCart = cart.FirstOrDefault(cartItem => cartItem.ProductItem?.Id == id);
    if (selectCardInTheCart != null)
    {
        selectCardInTheCart.IsSelected = selectedRequest.IsSelected;
        return Results.Ok(selectCardInTheCart);
    }
    return Results.NotFound();
});

app.MapDelete("/api/cart/checked", () => // removing all selected items from the cart after clicking the "Buy" button and simulating a purchase
{
    cart.RemoveAll(cartItem => cartItem.IsSelected);
    return Results.Ok(cart);
});

app.MapDelete("/api/cart/{id}", (int id) => // remove item from the cart
{
    var deleteCardFromTheCart = cart.FirstOrDefault(cartItem => cartItem.ProductItem?.Id == id);
    if (deleteCardFromTheCart != null)
    {
        cart.Remove(deleteCardFromTheCart);
        return Results.Ok(deleteCardFromTheCart);
    }
    return Results.NotFound();
});

app.Run();

public class ProductFromBody
{
    public string Category { get; set; } = "";
    public string Name { get; set; } = "";
    public List<string> PhotoLinks { get; set; } = new List<string>();
    public string Description { get; set; } = "";
    public decimal Price { get; set; }
}

public class UpdateQuantityRequest // to increase or decrease the number of product items in the cart
{
    public int UpdateQuantity { get; set; }
}

public class UpdateSelectedRequest // selected product card checkbox in the cart
{
    public bool IsSelected { get; set; }
}
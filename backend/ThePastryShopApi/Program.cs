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

List<Product> products = new List<Product>
{
    new Product {Id = 1, Category = "Cakes", Name = "First Cake", Description = "First cake in the list", Price = 282},
    new Product {Id = 2, Category = "Pasteries", Name = "First Pastery", Description = "First pastery in the list", Price = 115},
    new Product {Id = 3, Category = "Cookie", Name = "First Cookie", Description = "First cookie in the list", Price = 74},
};
int nextId = 4;

app.MapGet("/api/products", () => Results.Ok(products));

app.MapGet("/api/products/{id}", (int id) =>
{
    var getOneProduct = products.FirstOrDefault(p => p.Id == id);
    if (getOneProduct != null)
    {
        return Results.Ok(getOneProduct);
    }
    return Results.NotFound();
});

app.MapPost("/api/products", (ProductFromBody productFromBody) =>
{
    var newProduct = new Product
    {
        Id = nextId++,
        Category = productFromBody.Category,
        Name = productFromBody.Name,
        PhotoLinks = productFromBody.PhotoLinks,
        Description = productFromBody.Description,
        Price = productFromBody.Price,
    };
    products.Add(newProduct);
    return Results.Ok(newProduct);
});

app.MapDelete("/api/products/{id}", (int id) =>
{
    var deleteOneProduct = products.FirstOrDefault(p => p.Id == id);
    if (deleteOneProduct != null)
    {
        products.Remove(deleteOneProduct);
        return Results.Ok(deleteOneProduct);
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
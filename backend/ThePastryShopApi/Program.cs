var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

List<Product> products = new List<Product>
{
    new Product {Category = "Cakes", Name = "First Cake", Description = "First cake in the list", Price = 282},
    new Product {Category = "Pasteries", Name = "First Pastery", Description = "First pastery in the list", Price = 115},
    new Product {Category = "Cookie", Name = "First Cookie", Description = "First cookie in the list", Price = 74},
};

app.MapGet("/api/products", () => products);
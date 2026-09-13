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
    await dbContext.SaveChangesAsync();
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

app.Run();

public class ProductFromBody
{
    public string Category { get; set; } = "";
    public string Name { get; set; } = "";
    public List<string> PhotoLinks { get; set; } = new List<string>();
    public string Description { get; set; } = "";
    public decimal Price { get; set; }
}
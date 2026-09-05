public class Product
{
    public int Id { get; set; }
    public string Category { get; set; } = "";
    public string Name { get; set; } = "";
    public List<string> PhotoLinks { get; set; } = new List<string>();
    public string Description { get; set; } = "";
    public decimal Price { get; set; }
}
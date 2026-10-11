// ProductCardInTheCart.cs
public class ProductCardInTheCart
{
    public Product? ProductItem { get; set; } // added the ? to avoid the yellow line
    public DateTime AddedAt { get; set; }
    public int Quantity { get; set; }
    public bool IsSelected { get; set; } = false;
}
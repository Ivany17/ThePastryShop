// CartItem.cs
public class CartItem
{
    public int CartItemId { get; set; }
    public Product? ProductItem { get; set; } // added the ? to avoid the yellow line
    public DateTime AddedAt { get; set; }
    public int Quantity { get; set; }
}
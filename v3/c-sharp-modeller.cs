public class User
{
    public int Id { get; set; }
    public string Name { get; set; }
}

public class Account
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int? OwnerId { get; set; } // null = gemensamt konto
    public double Balance { get; set; }
}

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }
    public int SplitA { get; set; } // procent för UserA
    public int SplitB { get; set; } // procent för UserB
}

public class Transaction
{
    public int Id { get; set; }
    public int AccountId { get; set; }
    public int PayerId { get; set; }
    public double Amount { get; set; }
    public int CategoryId { get; set; }
    public DateTime Date { get; set; }
    public bool Shared { get; set; } // true = gemensam
}
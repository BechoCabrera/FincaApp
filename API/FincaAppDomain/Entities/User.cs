namespace FincaAppDomain.Entities;

public class User
{
    public Guid Id { get; private set; }
    public string Email { get; private set; } = null!;
    public string PasswordHash { get; private set; } = null!;
    public bool IsActive { get; private set; }

    public ICollection<UserTenant> UserTenants { get; private set; } = new List<UserTenant>();

    protected User() { }

    public User(string email, string passwordHash)
    {
        Id = Guid.NewGuid();
        Email = email;
        PasswordHash = passwordHash;
        IsActive = true;
    }
}

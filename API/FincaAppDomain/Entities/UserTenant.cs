namespace FincaAppDomain.Entities;

public class UserTenant
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string TenantId { get; set; } = null!;

}

namespace FincaAppDomain.Common;

public abstract class BaseEntity : ITenantEntity
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }

    // Auditoría opcional
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}

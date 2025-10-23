// ITenantProvider.cs
namespace FincaAppApi.Tenancy;

public interface ITenantProvider
{
    Guid TenantId { get; }
    bool HasTenant { get; }
}
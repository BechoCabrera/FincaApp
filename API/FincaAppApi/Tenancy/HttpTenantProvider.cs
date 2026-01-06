namespace FincaAppApi.Tenancy;
using FincaAppDomain.Common;

public sealed class HttpTenantProvider : ITenantProvider
{
    public Guid TenantId { get; }

    public HttpTenantProvider(IHttpContextAccessor accessor)
    {
        var tenant = accessor.HttpContext?
            .Request.Headers["X-Tenant-Id"]
            .FirstOrDefault();

        TenantId = Guid.TryParse(tenant, out var id)
            ? id
            : throw new UnauthorizedAccessException("Tenant no enviado");
    }
}

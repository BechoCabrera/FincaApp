namespace FincaAppApi.Tenancy;

using FincaAppDomain.Common;
using Microsoft.AspNetCore.Http;

public sealed class HttpTenantProvider : ITenantProvider
{
    private readonly IHttpContextAccessor _accessor;

    public HttpTenantProvider(IHttpContextAccessor accessor)
    {
        _accessor = accessor;
    }

    public string TenantId
    {
        get
        {
            var httpContext = _accessor.HttpContext;

            if (httpContext == null)
            {
                throw new UnauthorizedAccessException("Contexto HTTP no disponible");
            }

            var path = httpContext.Request.Path.Value?.ToLower();

            // 🔓 Endpoints públicos (login, reset, etc.)
            if (path != null && path.StartsWith("/api/auth"))
            {
                return string.Empty; // aún no hay tenant
            }

            var tenant = httpContext
                .Request.Headers["X-Tenant-Id"]
                .FirstOrDefault();

            if (string.IsNullOrWhiteSpace(tenant))
            {
                throw new UnauthorizedAccessException("Tenant no enviado");
            }

            return tenant;
        }
    }
}

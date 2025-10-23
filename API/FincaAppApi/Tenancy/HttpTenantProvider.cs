namespace FincaAppApi.Tenancy;

public class HttpTenantProvider : ITenantProvider
{
    public const string HeaderName = "X-Tenant-Id";
    private readonly IHttpContextAccessor _http;

    public HttpTenantProvider(IHttpContextAccessor http) => _http = http;

    public bool HasTenant => Guid.TryParse(GetRaw(), out _);
    public Guid TenantId =>
        Guid.TryParse(GetRaw(), out var id)
            ? id
            : throw new InvalidOperationException("Falta o es inválido el encabezado X-Tenant-Id.");

    private string? GetRaw() =>
        _http.HttpContext?.Request.Headers[HeaderName].FirstOrDefault();
}

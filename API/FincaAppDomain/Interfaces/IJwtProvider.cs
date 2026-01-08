namespace FincaAppDomain.Interfaces;

public interface IJwtProvider
{
    string Generate(Guid userId, string tenantId);
}

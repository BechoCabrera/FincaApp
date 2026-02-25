using FincaAppDomain.Common;

namespace FincaAppDomain.Entities;

public class Usuario : BaseEntity
{
    public Guid FincaId { get; set; }

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public string Rol { get; set; } = string.Empty;
}
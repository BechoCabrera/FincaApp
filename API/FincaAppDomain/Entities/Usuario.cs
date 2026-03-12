using FincaAppDomain.Common;

namespace FincaAppDomain.Entities;

public class Usuario : BaseEntity
{
    // Database table has a Nombre column (nvarchar(200) NOT NULL)
    public string Nombre { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;
}
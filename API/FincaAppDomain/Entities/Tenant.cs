using FincaAppDomain.Common;

namespace FincaAppDomain.Entities;

public class Tenant : BaseEntity
{
    public string Nombre { get; set; } = string.Empty;
    public string Documento { get; set; } = string.Empty;
}
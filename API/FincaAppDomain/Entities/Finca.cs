using FincaAppDomain.Common;

namespace FincaAppDomain.Entities;

public class Finca : BaseEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }

    public bool IsActive { get; set; } = true;
}
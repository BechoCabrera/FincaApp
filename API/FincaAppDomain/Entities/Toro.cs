using FincaAppDomain.Common;

namespace FincaAppDomain.Entities;

public class Toro : BaseEntity
{
    public string Nombre { get; set; } = default!;
    public DateTime? FechaNac { get; set; }
    public decimal? PesoKg { get; set; }
    public string? Color { get; set; }
    public string? Propietario { get; set; }
    public Guid FincaId { get; set; } = default!;
    public Guid? MadreId { get; set; }
    public string? Detalles { get; set; }
    public DateTime? FechaDestete { get; set; }
    public Finca Finca { get; set; } = default!;
    public Paridas Madre { get; set; } = default!;
}

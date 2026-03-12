using FincaAppDomain.Common;

namespace FincaAppDomain.Entities;

public class Parto : BaseEntity
{
    public Guid AnimalMadreId { get; set; }
    public Guid CriaId { get; set; }

    public DateTime FechaParto { get; set; }
    public DateTime? FechaPalpacion { get; set; }
    public DateTime? FechaNacimiento { get; set; }

    public string? GeneroCria { get; set; }

    public string? Color { get; set; }
    public string? TipoLeche { get; set; }
    public string? Procedencia { get; set; }
    public string? Propietario { get; set; }

    public string? Observaciones { get; set; }
}
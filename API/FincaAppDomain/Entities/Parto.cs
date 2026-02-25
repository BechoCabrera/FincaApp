using FincaAppDomain.Common;

namespace FincaAppDomain.Entities;

public class Parto : BaseEntity
{
    public Guid AnimalMadreId { get; set; }
    public Guid CriaId { get; set; }

    public DateTime FechaParto { get; set; }
    public string? Observaciones { get; set; }
}
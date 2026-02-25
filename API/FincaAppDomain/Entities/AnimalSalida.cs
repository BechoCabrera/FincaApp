using FincaAppDomain.Common;
using FincaAppDomain.Enums;

namespace FincaAppDomain.Entities;

public class AnimalSalida : BaseEntity
{
    public Guid AnimalId { get; set; }

    public TipoSalida TipoSalida { get; set; }

    public DateTime Fecha { get; set; }

    public decimal? Precio { get; set; }
    public string? Causa { get; set; }
}
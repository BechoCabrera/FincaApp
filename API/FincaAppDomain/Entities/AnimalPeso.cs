using FincaAppDomain.Common;

namespace FincaAppDomain.Entities;

public class AnimalPeso : BaseEntity
{
    public Guid AnimalId { get; set; }
    public DateTime Fecha { get; set; }
    public decimal Peso { get; set; }
}
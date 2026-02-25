using FincaAppDomain.Common;

namespace FincaAppDomain.Entities;

public class ProduccionLeche : BaseEntity
{
    public Guid AnimalId { get; set; }
    public DateTime Fecha { get; set; }
    public decimal Litros { get; set; }
}
using FincaAppDomain.Common;

namespace FincaAppDomain.Entities;

public class AnimalMovimiento : BaseEntity
{
    public Guid AnimalId { get; set; }

    // Make origen/destino nullable to allow movements without a concrete origin (e.g. birth)
    public Guid? FincaOrigenId { get; set; }
    public Guid? FincaDestinoId { get; set; }

    public DateTime FechaMovimiento { get; set; }
    public Guid UsuarioId { get; set; }
}
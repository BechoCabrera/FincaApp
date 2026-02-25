using FincaAppDomain.Common;

namespace FincaAppDomain.Entities;

public class AnimalEstadoHistorial : BaseEntity
{
    public Guid AnimalId { get; set; }

    public string EstadoAnterior { get; set; } = string.Empty;
    public string EstadoNuevo { get; set; } = string.Empty;

    public DateTime FechaCambio { get; set; }
    public Guid UsuarioId { get; set; }

    public string? Observacion { get; set; }
}
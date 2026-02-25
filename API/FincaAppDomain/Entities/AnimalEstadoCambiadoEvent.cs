using FincaAppDomain.Common;

namespace FincaAppDomain.Entities;

public class AnimalEstadoCambiadoEvent : DomainEvent
{
    public Guid AnimalId { get; }
    public string EstadoAnterior { get; }
    public string EstadoNuevo { get; }

    public AnimalEstadoCambiadoEvent(
        Guid animalId,
        string estadoAnterior,
        string estadoNuevo)
    {
        AnimalId = animalId;
        EstadoAnterior = estadoAnterior;
        EstadoNuevo = estadoNuevo;
    }
}
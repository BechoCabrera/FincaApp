using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using MediatR;

public class AnimalEstadoCambiadoEventHandler
    : INotificationHandler<AnimalEstadoCambiadoEvent>
{
    private readonly IAnimalEstadoHistorialRepository _repository;

    public AnimalEstadoCambiadoEventHandler(
        IAnimalEstadoHistorialRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(
        AnimalEstadoCambiadoEvent notification,
        CancellationToken cancellationToken)
    {
        var historial = new AnimalEstadoHistorial
        {
            AnimalId = notification.AnimalId,
            EstadoAnterior = notification.EstadoAnterior,
            EstadoNuevo = notification.EstadoNuevo,
            FechaCambio = DateTime.UtcNow,
            UsuarioId = notification.UsuarioId ?? Guid.Empty
        };

        await _repository.AddAsync(historial);
    }
}
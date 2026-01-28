using MediatR;
using FincaAppDomain.Repositories;
using FincaAppApplication.Features.Requests.ProximasRequest;

namespace FincaAppApplication.Features.Handlers.ProximaHandler;

public class DeleteProximaHandler
    : IRequestHandler<DeleteProximaRequest, Unit>
{
    private readonly IProximaRepository _proximaRepository;

    public DeleteProximaHandler(IProximaRepository proximaRepository)
    {
        _proximaRepository = proximaRepository;
    }

    public async Task<Unit> Handle(
        DeleteProximaRequest request,
        CancellationToken cancellationToken)
    {
        var entity = await _proximaRepository
            .GetByIdAsync(request.Id, cancellationToken);

        if (entity == null)
            throw new KeyNotFoundException("Registro no encontrado");

        await _proximaRepository
            .DeleteAsync(entity, cancellationToken);

        return Unit.Value;
    }
}

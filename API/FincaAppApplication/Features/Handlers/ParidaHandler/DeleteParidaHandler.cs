using MediatR;
using FincaAppDomain.Interfaces;
using FincaAppApplication.Features.Requests.ParidaRequest;

namespace FincaAppApplication.Features.Handlers.ParidaHandler;

public class DeleteParidaHandler : IRequestHandler<DeleteParidaRequest, Guid>
{
    private readonly IParidaRepository _repo;

    public DeleteParidaHandler(IParidaRepository repo)
    {
        _repo = repo;
    }

    public async Task<Guid> Handle(DeleteParidaRequest request, CancellationToken ct)
    {
        var entity = await _repo.GetByIdAsync(request.Id, ct);

        if (entity == null)
            throw new KeyNotFoundException("Parida no encontrada");

        await _repo.DeleteAsync(entity, ct);

        return entity.Id;
    }
}

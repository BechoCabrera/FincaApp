using MediatR;
using FincaAppDomain.Interfaces;
using FincaAppApplication.Features.Requests.Escotera;

namespace FincaAppApplication.Features.Handlers.Escotera;

public class DeleteEscoteraHandler : IRequestHandler<DeleteEscoteraRequest, Guid>
{
    private readonly IEscoteraRepository _repo;

    public DeleteEscoteraHandler(IEscoteraRepository repo)
    {
        _repo = repo;
    }

    public async Task<Guid> Handle(
        DeleteEscoteraRequest request,
        CancellationToken ct)
    {
        var escotera = await _repo.GetByIdAsync(request.Id, ct);

        if (escotera == null)
            throw new KeyNotFoundException("Escotera no encontrada.");

        await _repo.DeleteAsync(escotera, ct);

        return escotera.Id;
    }
}

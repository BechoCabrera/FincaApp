using MediatR;
using FincaAppApplication.Features.Requests.ToroRequest;
using FincaAppDomain.Interfaces;
using FincaAppApi.Application.Features.Requests.ToroRequest;

namespace FincaAppApplication.Features.Handlers.ToroHandler;

public class DeleteToroHandler : IRequestHandler<DeleteToroRequest, Unit>
{
    private readonly IToroRepository _toroRepository;

    public DeleteToroHandler(IToroRepository toroRepository)
    {
        _toroRepository = toroRepository;
    }

    public async Task<Unit> Handle(DeleteToroRequest request, CancellationToken cancellationToken)
    {
        await _toroRepository.DeleteAsync(request.Id, cancellationToken);
        return Unit.Value;
    }
}

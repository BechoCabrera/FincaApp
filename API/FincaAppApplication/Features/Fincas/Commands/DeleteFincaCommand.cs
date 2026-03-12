using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using FincaAppDomain.Interfaces;

namespace FincaAppApplication.Features.Fincas.Commands;

public class DeleteFincaCommand : IRequest<Unit>
{
    public Guid Id { get; set; }
}

public class DeleteFincaCommandHandler : IRequestHandler<DeleteFincaCommand, Unit>
{
    private readonly IFincaRepository _repository;

    public DeleteFincaCommandHandler(IFincaRepository repository)
    {
        _repository = repository;
    }

    public async Task<Unit> Handle(DeleteFincaCommand request, CancellationToken cancellationToken)
    {
        var finca = await _repository.GetByIdAsync(request.Id)
            ?? throw new InvalidOperationException("Finca no encontrada");

        // Borrado lógico: desactivar
        finca.IsActive = false;
        await _repository.UpdateAsync(finca);

        return Unit.Value;
    }
}

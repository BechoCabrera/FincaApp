using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using FincaAppApplication.DTOs.Finca;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;

namespace FincaAppApplication.Features.Fincas.Commands;

public class UpdateFincaCommand : IRequest<Unit>
{
    public Guid Id { get; set; }
    public CreateFincaRequestDto Request { get; set; } = default!;
}

public class UpdateFincaCommandHandler : IRequestHandler<UpdateFincaCommand, Unit>
{
    private readonly IFincaRepository _repository;

    public UpdateFincaCommandHandler(IFincaRepository repository)
    {
        _repository = repository;
    }

    public async Task<Unit> Handle(UpdateFincaCommand request, CancellationToken cancellationToken)
    {
        var finca = await _repository.GetByIdAsync(request.Id)
            ?? throw new InvalidOperationException("Finca no encontrada");

        finca.Codigo = request.Request.Codigo;
        finca.Nombre = request.Request.Nombre;
        finca.Descripcion = request.Request.Descripcion;
        finca.IsActive = request.Request.IsActive;

        await _repository.UpdateAsync(finca);

        return Unit.Value;
    }
}

using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppApplication.DTOs.Parto;

namespace FincaAppApplication.Features.Partos.Commands;

public class UpdatePartoCommand : IRequest<Unit>
{
    public Guid PartoId { get; set; }
    public UpdatePartoRequestDto Request { get; set; } = default!;
}

public class UpdatePartoCommandHandler : IRequestHandler<UpdatePartoCommand, Unit>
{
    private readonly IPartoRepository _partoRepository;

    public UpdatePartoCommandHandler(IPartoRepository partoRepository)
    {
        _partoRepository = partoRepository;
    }

    public async Task<Unit> Handle(UpdatePartoCommand request, CancellationToken cancellationToken)
    {
        var parto = await _partoRepository.GetByIdAsync(request.PartoId);
        if (parto == null) throw new KeyNotFoundException("Parto no encontrado");

        var dto = request.Request;

        parto.FechaParto = dto.FechaParida;
        parto.FechaPalpacion = dto.FechaPalpacion;
        parto.FechaNacimiento = dto.FechaNacimiento;
        parto.GeneroCria = dto.GeneroCria;
        parto.Color = dto.Color;
        parto.TipoLeche = dto.TipoLeche;
        parto.Procedencia = dto.Procedencia;
        parto.Propietario = dto.Propietario;
        parto.Observaciones = dto.Observaciones;

        // snapshot update if provided
        if (dto.CriaNumero != null) parto.CriaNumero = dto.CriaNumero;
        if (dto.CriaNombre != null) parto.CriaNombre = dto.CriaNombre;
        if (dto.CriaColor != null) parto.CriaColor = dto.CriaColor;
        if (dto.CriaPropietario != null) parto.CriaPropietario = dto.CriaPropietario;
        if (dto.CriaPesoKg.HasValue) parto.CriaPesoKg = dto.CriaPesoKg;
        if (dto.CriaDetalles != null) parto.CriaDetalles = dto.CriaDetalles;

        await _partoRepository.UpdateAsync(parto);
        return Unit.Value;
    }
}

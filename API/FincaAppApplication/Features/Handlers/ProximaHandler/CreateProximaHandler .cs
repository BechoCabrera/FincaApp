using AutoMapper;
using FincaAppApplication.DTOs.Proxima;
using FincaAppApplication.Features.Requests.ProximasRequest;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppDomain.Repositories;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.ProximaHandler;
public class CreateProximaHandler : IRequestHandler<CreateProximaRequest, ProximaDto>
{
    private readonly IProximaRepository _proximaRepository;
    private readonly IMapper _mapper;

    public CreateProximaHandler(
        IProximaRepository proximaRepository,
        IMapper mapper)
    {
        _proximaRepository = proximaRepository;
        _mapper = mapper;
    }

    public async Task<ProximaDto> Handle(CreateProximaRequest request, CancellationToken cancellationToken)
    {
        var proxima = new Proxima
        {
            Id = Guid.NewGuid(),
            Numero = request.Numero,
            Nombre = request.Nombre,
            FechaNacida = request.FechaNacida,
            Color = request.Color,
            NroMama = request.NroMama,
            Procedencia = request.Procedencia,
            Propietario = request.Propietario,
            FechaDestete = request.FechaDestete,
            FPalpacion = request.FPalpacion,
            DPrenez = request.DPrenez,
            Detalles = request.Detalles,
            FincaId = request.FincaId
        };

        try
        {
            await _proximaRepository.AddAsync(proxima, cancellationToken);
        }
        catch (Exception ex) when (IsUniqueConstraintViolation(ex))
        {
            throw new InvalidOperationException(
                $"Ya existe un registro de próximas con número '{request.Numero}'.");
        }

        return _mapper.Map<ProximaDto>(proxima);
    }

    private static bool IsUniqueConstraintViolation(Exception ex)
    {
        return ex.InnerException?.Message.Contains("IX_Proximas_Tenant") == true;
    }
}

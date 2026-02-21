using AutoMapper;
using MediatR;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppApi.Application.Features.Requests.ToroRequest;
using FincaAppApi.DTOs.Toro;

namespace FincaAppApplication.Features.Handlers.ToroHandler;

public class CreateToroHandler : IRequestHandler<CreateToroRequest, ToroDto>
{
    private readonly IToroRepository _toroRepository;
    private readonly IMapper _mapper;

    public CreateToroHandler(IToroRepository toroRepository, IMapper mapper)
    {
        _toroRepository = toroRepository;
        _mapper = mapper;
    }

    public async Task<ToroDto> Handle(CreateToroRequest request, CancellationToken cancellationToken)
    {
        var toro = new Toro
        {
            Id = Guid.NewGuid(),
            Nombre = request.Nombre,
            FechaNac = request.FechaNac,
            PesoKg = request.PesoKg,
            Color = request.Color,
            Propietario = request.Propietario,
            FincaId = request.FincaId,
            MadreId = request.MadreId,
            Detalles = request.Detalles,
            FechaDestete = request.FechaDestete
        };

        try
        {
            await _toroRepository.AddAsync(toro, cancellationToken);
        }
        catch (Exception ex) when (IsUniqueConstraintViolation(ex))
        {
            throw new InvalidOperationException(
                $"Error.");
        }

        return _mapper.Map<ToroDto>(toro);
    }

    private static bool IsUniqueConstraintViolation(Exception ex)
    {
        return ex.InnerException?.Message.Contains("IX_Toros_TenantId_Numero") == true;
    }
}

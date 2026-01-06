using AutoMapper;
using MediatR;
using FincaAppApplication.Features.Requests.ToroRequest;
using FincaAppDomain.Interfaces;
using FincaAppApi.DTOs.Toro;

namespace FincaAppApplication.Features.Handlers.ToroHandler;

public class UpdateToroHandler : IRequestHandler<UpdateToroRequest, ToroDto>
{
    private readonly IToroRepository _repo;
    private readonly IMapper _mapper;

    public UpdateToroHandler(IToroRepository repo, IMapper mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }

    public async Task<ToroDto> Handle(UpdateToroRequest request, CancellationToken ct)
    {
        var toro = await _repo.GetByIdAsync(request.Id, ct);

        if (toro is null)
            throw new KeyNotFoundException("Toro no encontrado.");

        toro.Numero = request.Numero;
        toro.Nombre = request.Nombre;
        toro.FechaNacimiento = request.FechaNac;
        toro.PesoKg = request.PesoKg;
        toro.Color = request.Color;
        toro.Propietario = request.Propietario;
        toro.FincaId = request.FincaId;
        toro.MadreNumero = request.MadreNumero;
        toro.Detalles = request.Detalles;
        toro.FechaDestete = request.FechaDestete;

        await _repo.UpdateAsync(toro, ct);

        return _mapper.Map<ToroDto>(toro);
    }
}

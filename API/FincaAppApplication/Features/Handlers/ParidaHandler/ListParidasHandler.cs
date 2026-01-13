using MediatR;
using FincaAppDomain.Interfaces;
using FincaAppApplication.DTOs.Parida;
using FincaAppApplication.Features.Requests.ParidaRequest;

namespace FincaAppApplication.Features.Handlers.Parida;

public class ListParidasHandler
    : IRequestHandler<ListParidasRequest, List<ParidaDto>>
{
    private readonly IParidaRepository _repo;

    public ListParidasHandler(IParidaRepository repo)
    {
        _repo = repo;
    }

    public async Task<List<ParidaDto>> Handle(
        ListParidasRequest request,
        CancellationToken ct)
    {
        var items = await _repo.GetAllAsync(ct);
        return items.Select(p =>
        {
        var dp = (int?)(DateTime.UtcNow.Date - p.FechaParida.Date).TotalDays;

        return new ParidaDto
        {
            Id = p.Id,
            Numero = p.Numero,
            Nombre = p.Nombre,

            FechaNacimiento = p.FechaNacimiento,
            FechaParida = p.FechaParida,
            FechaPalpacion = p.FechaPalpacion,

            Color = p.Color,
            TipoLeche = p.TipoLeche,
            Procedencia = p.Procedencia,
            Propietario = p.Propietario,

            Dp = dp,
            GeneroCria = p.GeneroCria,
            Observaciones = p.Observaciones,

            FincaId = p.FincaId
        };
    })
    .ToList();

    }
}

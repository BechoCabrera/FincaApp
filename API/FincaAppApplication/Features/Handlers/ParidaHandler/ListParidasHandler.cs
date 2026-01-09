using MediatR;
using FincaAppDomain.Interfaces;
using FincaAppApplication.DTOs.Parida;
using FincaAppApplication.Features.Requests.ParidaRequest;

namespace FincaAppApplication.Features.Handlers.Parida;

public class ListParidasHandler
    : IRequestHandler<ListParidasRequest, List<ParidaListDto>>
{
    private readonly IParidaRepository _repo;

    public ListParidasHandler(IParidaRepository repo)
    {
        _repo = repo;
    }

    public async Task<List<ParidaListDto>> Handle(
        ListParidasRequest request,
        CancellationToken ct)
    {
        var items = await _repo.GetAllAsync(ct);

        return items.Select(p => new ParidaListDto
        {
            Id = p.Id,
            Numero = p.Numero,
            FincaId = p.FincaId,
            FechaParida = p.FechaParida,
            GeneroCria = p.GeneroCria,
            FechaPalpacion = p.FechaPalpacion,
            TipoLeche = p.TipoLeche,
            Observaciones = p.Observaciones,
            Nombre = p.Nombre
        }).ToList();
    }
}

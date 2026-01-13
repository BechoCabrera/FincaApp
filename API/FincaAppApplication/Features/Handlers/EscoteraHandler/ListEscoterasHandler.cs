using MediatR;
using FincaAppDomain.Interfaces;
using FincaAppApplication.DTOs.Escotera;
using FincaAppApplication.Features.Requests.Escotera;

namespace FincaAppApplication.Features.Handlers.Escotera;

public class ListEscoterasHandler
    : IRequestHandler<ListEscoterasRequest, List<EscoteraDto>>
{
    private readonly IEscoteraRepository _repo;

    public ListEscoterasHandler(IEscoteraRepository repo)
    {
        _repo = repo;
    }

    public async Task<List<EscoteraDto>> Handle(
        ListEscoterasRequest request,
        CancellationToken ct)
    {
        var items = await _repo.GetAllAsync(ct);

        return items.Select(e => new EscoteraDto
        {
            Id = e.Id,
            Numero = e.Numero,
            Nombre = e.Nombre,

            Color = e.Color,
            Procedencia = e.Procedencia,
            Propietario = e.Propietario,

            NroMama = e.NroMama,
            FechaNacida = e.FechaNacida,
            TipoLeche = e.TipoLeche,

            FPalpacion = e.FPalpacion,
            DPrenez = e.DPrenez,

            Detalles = e.Detalles,
            FechaDestete = e.FechaDestete,

            VacaId = e.VacaId,
            FincaId = e.FincaId
        }).ToList();
    }
}

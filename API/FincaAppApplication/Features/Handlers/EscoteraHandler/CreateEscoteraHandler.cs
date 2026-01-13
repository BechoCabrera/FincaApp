using MediatR;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppApplication.Features.Requests.Escotera;

namespace FincaAppApplication.Features.Handlers.Escotera;

public class CreateEscoteraHandler
    : IRequestHandler<CreateEscoteraRequest, Guid>
{
    private readonly IEscoteraRepository _repo;

    public CreateEscoteraHandler(IEscoteraRepository repo)
    {
        _repo = repo;
    }

    public async Task<Guid> Handle(
        CreateEscoteraRequest request,
        CancellationToken ct)
    {
        var exists = await _repo.ExistsNumeroEscoteraAsync(
            request.Numero,
            null,
            ct);

        if (exists)
            throw new InvalidOperationException("El número de escotera ya existe.");

        var escotera = new Escoteras
        {
            Numero = request.Numero,
            Nombre = request.Nombre,

            Color = request.Color,
            Procedencia = request.Procedencia,
            Propietario = request.Propietario,

            NroMama = request.NroMama,
            FechaNacida = request.FechaNacida,
            TipoLeche = request.TipoLeche,

            FPalpacion = request.FPalpacion,
            DPrenez = request.DPrenez,

            Detalles = request.Detalles,
            FechaDestete = request.FechaDestete,

            VacaId = request.VacaId,
            FincaId = request.FincaId
        };

        await _repo.AddAsync(escotera, ct);

        return escotera.Id;
    }
}

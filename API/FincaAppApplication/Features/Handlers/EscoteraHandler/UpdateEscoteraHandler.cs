using MediatR;
using FincaAppDomain.Interfaces;
using FincaAppApplication.Features.Requests.Escotera;

namespace FincaAppApplication.Features.Handlers.Escotera;

public class UpdateEscoteraHandler : IRequestHandler<UpdateEscoteraRequest, Guid>
{
    private readonly IEscoteraRepository _repo;

    public UpdateEscoteraHandler(IEscoteraRepository repo)
    {
        _repo = repo;
    }

    public async Task<Guid> Handle(
        UpdateEscoteraRequest request,
        CancellationToken ct)
    {
        var escotera = await _repo.GetByIdAsync(request.Id, ct);

        if (escotera == null)
            throw new KeyNotFoundException("Escotera no encontrada.");

        var exists = await _repo.ExistsNumeroEscoteraAsync(
            request.Numero,
            request.Id,
            ct);

        if (exists)
            throw new InvalidOperationException("El número de escotera ya existe.");

        escotera.Numero = request.Numero;
        escotera.Nombre = request.Nombre;

        escotera.Color = request.Color;
        escotera.Procedencia = request.Procedencia;
        escotera.Propietario = request.Propietario;

        escotera.NroMama = request.NroMama;
        escotera.FechaNacida = request.FechaNacida;
        escotera.TipoLeche = request.TipoLeche;

        escotera.FPalpacion = request.FPalpacion;
        escotera.DPrenez = request.DPrenez;

        escotera.Detalles = request.Detalles;
        escotera.FechaDestete = request.FechaDestete;

        escotera.VacaId = request.VacaId;
        escotera.FincaId = request.FincaId;

        await _repo.UpdateAsync(escotera, ct);

        return escotera.Id;
    }
}

using MediatR;
using FincaAppDomain.Interfaces;
using FincaAppApplication.Features.Requests.ParidaRequest;
using ParidaEntity = FincaAppDomain.Entities.Paridas;

namespace FincaAppApplication.Features.Handlers.ParidaRequest;

public class CreateParidaHandler : IRequestHandler<CreateParidaRequest, Guid>
{
    private readonly IParidaRepository _paridaRepository;

    public CreateParidaHandler(IParidaRepository paridaRepository)
    {
        _paridaRepository = paridaRepository;
    }

    public async Task<Guid> Handle(CreateParidaRequest request, CancellationToken cancellationToken)
    {
        // Validaciones mínimas de dominio
        if (request.FechaParida > DateTime.UtcNow.AddDays(1))
            throw new ArgumentException("La fecha de la parida no puede ser futura");

        if (request.GeneroCria != "Hembra" && request.GeneroCria != "Macho")
            throw new ArgumentException("Género de cría inválido");

        // 🚨 VALIDACIÓN CLAVE: NÚMERO DUPLICADO
        var exists = await _paridaRepository.ExistsByNumeroAsync(
            request.Numero,
            cancellationToken);

        if (exists)
            throw new InvalidOperationException(
                $"Ya existe una parida con el número '{request.Numero}'");

        var parida = new ParidaEntity(
             request.Nombre,
             request.Numero,
             request.FincaId,
             request.GeneroCria,
             request.FechaParida,
             request.FechaPalpacion,
             request.FechaNacimiento,
             request.Color,
             request.TipoLeche,
             request.Procedencia,
             request.Observaciones,
             request.Propietario
         );

        await _paridaRepository.AddAsync(parida, cancellationToken);

        return parida.Id;
    }
}

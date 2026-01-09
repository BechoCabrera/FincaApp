using MediatR;
using FincaAppDomain.Interfaces;
using FincaAppApplication.Features.Requests.ParidaRequest;
using ParidaEntity = FincaAppDomain.Entities.Parida;

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

        var parida = new ParidaEntity(
               request.Numero,
               request.FincaId,
               request.FechaParida,
               request.GeneroCria,
               request.FechaPalpacion,
               request.TipoLeche,
               request.Observaciones,
               request.Nombre
           );

        await _paridaRepository.AddAsync(parida, cancellationToken);

        return parida.Id;
    }
}

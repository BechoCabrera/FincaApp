using MediatR;

namespace FincaAppApplication.Features.Requests.ParidaRequest;

public class CreateParidaRequest : IRequest<Guid>
{
    public string Numero { get; init; } = default!;
    public string Nombre { get; init; } = default!;
    public Guid FincaId { get; init; }

    public DateTime FechaParida { get; init; }
    public string GeneroCria { get; init; } = default!;

    public DateTime? FechaPalpacion { get; init; }
    public string? TipoLeche { get; init; }
    public string? Observaciones { get; init; }
}

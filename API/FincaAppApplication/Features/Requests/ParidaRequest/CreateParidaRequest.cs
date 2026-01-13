using MediatR;

namespace FincaAppApplication.Features.Requests.ParidaRequest;

public class CreateParidaRequest : IRequest<Guid>
{
    public string Nombre { get; init; } = default!;
    public string Numero { get; init; } = default!;

    public Guid FincaId { get; init; }

    public string GeneroCria { get; init; } = default!;
    public DateTime FechaParida { get; init; }

    public DateTime? FechaPalpacion { get; init; }
    public DateTime? FechaNacimiento { get; init; }

    public string? Color { get; init; }
    public string? TipoLeche { get; init; }
    public string? Procedencia { get; init; }
    public string? Observaciones { get; init; }
    public string? Propietario { get; init; }
}

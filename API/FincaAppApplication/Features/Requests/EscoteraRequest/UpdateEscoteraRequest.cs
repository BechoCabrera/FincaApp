using MediatR;

namespace FincaAppApplication.Features.Requests.Escotera;

public class UpdateEscoteraRequest : IRequest<Guid>
{
    public Guid Id { get; set; }
    public string Numero { get; set; }
    public string Nombre { get; set; } = null!;
    public string? Color { get; set; }
    public string? Procedencia { get; set; }
    public string? Propietario { get; set; }

    public string? NroMama { get; set; }

    public DateTime? FechaNacida { get; set; }
    public string? TipoLeche { get; set; }

    public DateTime? FPalpacion { get; set; }
    public int? DPrenez { get; set; }

    public string? Detalles { get; set; }
    public DateTime? FechaDestete { get; set; }

    public Guid? VacaId { get; set; }
    public Guid? FincaId { get; set; }
}

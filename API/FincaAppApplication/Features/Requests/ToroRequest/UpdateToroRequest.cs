using MediatR;
using FincaAppApi.DTOs.Toro;

namespace FincaAppApplication.Features.Requests.ToroRequest;

public class UpdateToroRequest : IRequest<ToroDto>
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = default!;
    public DateTime? FechaNac { get; set; }
    public decimal? PesoKg { get; set; }
    public string? Color { get; set; }
    public string? Propietario { get; set; }
    public Guid FincaId { get; set; }
    public string? Detalles { get; set; }
    public DateTime? FechaDestete { get; set; }
    public Guid? MadreId { get; set; } // AGREGAR

}

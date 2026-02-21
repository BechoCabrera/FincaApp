using FincaAppApi.DTOs.Toro;
using MediatR;

namespace FincaAppApi.Application.Features.Requests.ToroRequest
{
    public class CreateToroRequest : IRequest<ToroDto>
    {
        public string Nombre { get; set; } = default!;
        public DateTime? FechaNac { get; set; }
        public decimal? PesoKg { get; set; }
        public string? Color { get; set; }
        public string? Propietario { get; set; }
        public Guid FincaId { get; set; } = default!;
        public Guid? MadreId { get; set; } // AGREGAR

        public string? Detalles { get; set; }
        public DateTime? FechaDestete { get; set; }
    }
}

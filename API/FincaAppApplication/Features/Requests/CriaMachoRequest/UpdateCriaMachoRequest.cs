using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.CriaMachoRequest
{
    public class UpdateCriaMachoRequest : IRequest<Guid>
    {
        public Guid Id { get; set; }

        public string Nombre { get; set; } = null!;
        public DateTime? FechaNac { get; set; }
        public string? Color { get; set; }
        public string? Propietario { get; set; }
        public double? PesoKg { get; set; }
        public Guid? FincaId { get; set; }
        public Guid? MadreId { get; set; }
        public string? MadreNombre { get; set; }
        public string? Detalles { get; set; }
    }
}

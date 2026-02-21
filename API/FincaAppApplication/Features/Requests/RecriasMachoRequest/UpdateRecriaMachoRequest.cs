using FincaAppApplication.DTOs.RecriasMacho;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.RecriasMachoRequest
{
    public class UpdateRecriaMachoRequest : IRequest<RecriaMachoDto>
    {
        public Guid Id { get; set; }
        public string Nombre { get; set; } = default!;
        public DateTime? FechaNac { get; set; }
        public decimal? PesoKg { get; set; }
        public string? Color { get; set; }
        public string? Propietario { get; set; }
        public Guid FincaId { get; set; }
        public Guid? MadreId { get; set; }
        public string? Detalles { get; set; }
        public DateTime? FechaDestete { get; set; }
    }
}

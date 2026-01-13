using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.ParidaRequest
{
    public class UpdateParidaRequest : IRequest<Guid>
    {
        public Guid Id { get; set; }

        public string Numero { get; set; } = default!;
        public string Nombre { get; set; } = default!;
        public string GeneroCria { get; set; } = default!;

        public DateTime FechaParida { get; set; }
        public DateTime? FechaPalpacion { get; set; }
        public DateTime? FechaNacimiento { get; set; }

        public string? Color { get; set; }
        public string? TipoLeche { get; set; }
        public string? Procedencia { get; set; }
        public string? Propietario { get; set; }
        public string? Observaciones { get; set; }

        public Guid FincaId { get; set; }
    }

}

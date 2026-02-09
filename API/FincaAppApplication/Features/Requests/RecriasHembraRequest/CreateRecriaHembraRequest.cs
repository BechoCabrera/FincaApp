using FincaAppApplication.DTOs.RecriaHembra;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Requests.RecriasHembraRecuest
{
    public class CreateRecriaHembraRequest : IRequest<Guid>
    {
        public string Numero { get; set; }
        public string Nombre { get; set; }
        public DateTime? FechaNac { get; set; }
        public decimal? PesoKg { get; set; }
        public string? Color { get; set; }
        public string? Propietario { get; set; }
        public string? FincaId { get; set; }
        public string? MadreNumero { get; set; }
        public string? Detalles { get; set; }
        public DateTime? FechaDestete { get; set; }
    }
}

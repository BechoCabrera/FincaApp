using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FincaAppDomain.Common;

namespace FincaAppDomain.Entities
{
    public class AnimalDestete : BaseEntity
    {
        public Guid AnimalId { get; set; }

        public DateTime Fecha { get; set; }

        public decimal? PesoKg { get; set; }

        public string? Observacion { get; set; }
    }
}

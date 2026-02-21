using FincaAppDomain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppDomain.Entities
{
    public class Fallecida : BaseEntity
    {
        public string Categoria { get; set; } = null!;
        public Guid AnimalId { get; set; }
        public DateTime FechaFallecimiento { get; set; }
        public string? Causa { get; set; }
        public string? Notas { get; set; }

        protected Fallecida() { }

        public Fallecida(string categoria, Guid animalId, DateTime fechaFallecimiento, string? causa, string? notas)
        {
            Categoria = categoria;
            AnimalId = animalId;
            FechaFallecimiento = fechaFallecimiento;
            Causa = causa;
            Notas = notas;
        }
    }
}

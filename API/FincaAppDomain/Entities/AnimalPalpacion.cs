using FincaAppDomain.Common;

namespace FincaAppDomain.Entities
{
    public class AnimalPalpacion : BaseEntity
    {
        public Guid AnimalId { get; set; }
        public DateTime FechaPalpacion { get; set; }
        public Guid UsuarioId { get; set; }
        public string? Notas { get; set; }
    }
}

using FincaAppDomain.Common;

namespace FincaAppDomain.Entities
{
    public class Finca : BaseEntity
    {
        public string Codigo { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public string? Descripcion { get; set; }

        public bool IsActive { get; set; } = true;
    }
}

namespace FincaAppApplication.DTOs.CriaHembra
{
    public class CreateCriaHembraDto
    {
        public string Numero { get; set; } = null!;
        public string Nombre { get; set; } = null!;
        public DateTime? FechaNac { get; set; }
        public string? Color { get; set; }
        public string? Propietario { get; set; }
        public double? PesoKg { get; set; }
        public Guid? FincaId { get; set; }
        public string? MadreNumero { get; set; }
        public string? MadreNombre { get; set; }
        public string? Detalles { get; set; }
    }    
}

namespace FincaAppApi.Domain.Entities
{
    public class Toro
    {
        public Guid Id { get; set; }
        public string Numero { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public DateTime FechaNacimiento { get; set; }
        public decimal Peso { get; set; }
        public string Finca { get; set; } = string.Empty;
    }
}

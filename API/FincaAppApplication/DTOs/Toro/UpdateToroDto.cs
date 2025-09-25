namespace FincaAppApi.DTOs.Toro
{
    public class UpdateToroDto
    {
        public string Numero { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public DateTime FechaNacimiento { get; set; }
        public decimal Peso { get; set; }
        public string Finca { get; set; } = string.Empty;
    }
}

namespace FincaAppApplication.DTOs.Animal;

public class AnimalTimelineDto
{
    public string TipoEvento { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public DateTime Fecha { get; set; }
}
using System;

namespace FincaAppApplication.DTOs.Parto;

public class PartoDto
{
    public Guid Id { get; set; }
    public Guid AnimalMadreId { get; set; }
    public Guid CriaId { get; set; }
    public DateTime FechaParto { get; set; }
    public string? Observaciones { get; set; }
}

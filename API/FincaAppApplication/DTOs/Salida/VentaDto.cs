using System;

namespace FincaAppApplication.DTOs.Salida;

public class VentaDto
{
    public Guid Id { get; set; }
    public Guid AnimalId { get; set; }
    public DateTime FechaVenta { get; set; }
    public string? Comprador { get; set; }
    public decimal? Precio { get; set; }
    public string? Notas { get; set; }
}

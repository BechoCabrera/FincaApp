using System;

namespace FincaAppApplication.DTOs.Parto;

public class UpdatePartoRequestDto
{
    public DateTime FechaParida { get; set; }
    public DateTime? FechaPalpacion { get; set; }
    public DateTime? FechaNacimiento { get; set; }

    public string? GeneroCria { get; set; }

    public string? Color { get; set; }
    public string? TipoLeche { get; set; }
    public string? Procedencia { get; set; }
    public string? Propietario { get; set; }

    public string? Observaciones { get; set; }

    // snapshot fields (optional)
    public string? CriaNumero { get; set; }
    public string? CriaNombre { get; set; }
    public string? CriaColor { get; set; }
    public string? CriaPropietario { get; set; }
    public decimal? CriaPesoKg { get; set; }
    public string? CriaDetalles { get; set; }
}

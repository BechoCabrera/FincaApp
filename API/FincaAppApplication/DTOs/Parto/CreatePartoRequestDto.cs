using System;

namespace FincaAppApplication.DTOs.Parto;

public class CreatePartoRequestDto
{
    // Datos madre
    public string Numero { get; set; } = string.Empty; // numero arete madre
    public string Nombre { get; set; } = string.Empty; // nombre madre
    public Guid FincaId { get; set; }

    // Datos parto
    public DateTime FechaParida { get; set; }
    public DateTime? FechaPalpacion { get; set; }
    public DateTime? FechaNacimiento { get; set; }
    public string? Color { get; set; }
    public string? TipoLeche { get; set; }
    public string? Procedencia { get; set; }
    public string? Propietario { get; set; }
    public string? Observaciones { get; set; }

    // genero de la cria
    public string GeneroCria { get; set; } = "Hembra"; // Hembra | Macho

    // Opcional: permitir que el cliente envíe número de arete para la cría
    public string? NumeroCria { get; set; }

    // Datos de la cria (si se colectan desde UI)
    public string? CriaNombre { get; set; }
    public string? CriaColor { get; set; }
    public string? CriaPropietario { get; set; }
    public decimal? CriaPesoKg { get; set; }
    public string? CriaDetalles { get; set; }
}

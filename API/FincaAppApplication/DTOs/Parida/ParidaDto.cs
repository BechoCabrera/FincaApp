namespace FincaAppApplication.DTOs.Parida;

public class ParidaDto
{
    public Guid Id { get; set; }
    public string Numero { get; set; } = default!;
    public string Nombre { get; set; } = default!;

    public DateTime? FechaNacimiento { get; set; }
    public DateTime FechaParida { get; set; }
    public DateTime? FechaPalpacion { get; set; }

    public string? Color { get; set; }
    public string? TipoLeche { get; set; }
    public string? Procedencia { get; set; }
    public string? Propietario { get; set; }

    public string GeneroCria { get; set; } = default!;
    public string? Observaciones { get; set; }

    public Guid FincaId { get; set; }

    public int? Dp { get; set; }
}
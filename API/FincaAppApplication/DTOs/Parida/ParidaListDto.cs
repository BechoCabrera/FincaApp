namespace FincaAppApplication.DTOs.Parida;

public class ParidaListDto
{
    public Guid Id { get; set; }
    public string Numero { get; set; } = default!;
    public string Nombre { get; set; } = default!;
    public Guid FincaId { get; set; }
    public DateTime FechaParida { get; set; }
    public string GeneroCria { get; set; } = default!;
    public DateTime? FechaPalpacion { get; set; }
    public string? TipoLeche { get; set; }
    public string? Observaciones { get; set; }
}

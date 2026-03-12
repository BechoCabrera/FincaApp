using System.ComponentModel.DataAnnotations;

namespace FincaAppApplication.DTOs.Finca;

public class CreateFincaRequestDto
{
    [Required]
    [StringLength(50, MinimumLength = 1)]
    public string Codigo { get; set; } = string.Empty;

    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Descripcion { get; set; }

    public bool IsActive { get; set; } = true;
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.DTOs.Fallecida;
public class FallecidaDto
{
    public Guid Id { get; set; }
    public string Categoria { get; set; } = string.Empty;
    public Guid AnimalId { get; set; }
    public DateTime FechaFallecimiento { get; set; }
    public string? Causa { get; set; }
    public string? Notas { get; set; }
}

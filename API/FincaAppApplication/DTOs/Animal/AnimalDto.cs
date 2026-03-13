using FincaAppDomain.Enums;

namespace FincaAppApplication.DTOs.Animal;

public class AnimalDto
{
    public Guid Id { get; set; }
    public string NumeroArete { get; set; } = string.Empty;

    // Nombre
    public string Nombre { get; set; } = string.Empty;

    public TipoAnimal Tipo { get; set; }
    public PropositoAnimal Proposito { get; set; }

    public DateTime FechaNacimiento { get; set; }

    public EstadoHembra? EstadoActualHembra { get; set; }
    public EstadoMacho? EstadoActualMacho { get; set; }

    public bool Activo { get; set; }

    public Guid FincaActualId { get; set; }

    // Extended / optional properties used by UI
    public DateTime? FechaParida { get; set; }
    public DateTime? FechaPalpacion { get; set; }
    public DateTime? FechaNacimientoCria { get; set; }

    public string? Color { get; set; }
    public string? TipoLeche { get; set; }
    public string? Procedencia { get; set; }
    public string? Propietario { get; set; }
    public string? Observaciones { get; set; }

    // Optional extra fields often used by views
    public decimal? PesoKg { get; set; }
    public string? Detalles { get; set; }

    // Optional mother linkage info for cria rows / UI
    public Guid? MadreId { get; set; }
    public string? MadreNumero { get; set; }
    public string? MadreNombre { get; set; }

    public DateTime? FechaDestete { get; set; }

    public string? CreatedAt { get; set; }
    public string? UpdatedAt { get; set; }
}
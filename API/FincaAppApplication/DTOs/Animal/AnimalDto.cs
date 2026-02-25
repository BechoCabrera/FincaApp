using FincaAppDomain.Enums;

namespace FincaAppApplication.DTOs.Animal;

public class AnimalDto
{
    public Guid Id { get; set; }
    public string NumeroArete { get; set; } = string.Empty;

    public TipoAnimal Tipo { get; set; }
    public PropositoAnimal Proposito { get; set; }

    public DateTime FechaNacimiento { get; set; }

    public EstadoHembra? EstadoActualHembra { get; set; }
    public EstadoMacho? EstadoActualMacho { get; set; }

    public bool Activo { get; set; }

    public Guid FincaActualId { get; set; }
}
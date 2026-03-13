using FincaAppDomain.Enums;

namespace FincaAppApplication.DTOs.Animal;

public class CreateAnimalRequestDto
{
    public string NumeroArete { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public TipoAnimal Tipo { get; set; }
    public PropositoAnimal Proposito { get; set; }
    public DateTime FechaNacimiento { get; set; }

    public Guid FincaId { get; set; }
    public Guid? MadreId { get; set; }
    public Guid? PadreId { get; set; }

    // Optional: allow client to request a specific initial/target state
    public EstadoHembra? EstadoActualHembra { get; set; }
    public EstadoMacho? EstadoActualMacho { get; set; }
}
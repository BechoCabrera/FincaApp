using FincaAppDomain.Enums;

namespace FincaAppApplication.DTOs.Animal;

public class CreateAnimalRequestDto
{
    public string NumeroArete { get; set; } = string.Empty;
    public TipoAnimal Tipo { get; set; }
    public PropositoAnimal Proposito { get; set; }
    public DateTime FechaNacimiento { get; set; }

    public Guid FincaId { get; set; }
    public Guid? MadreId { get; set; }
    public Guid? PadreId { get; set; }
}
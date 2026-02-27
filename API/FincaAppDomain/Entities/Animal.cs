using FincaAppDomain.Common;
using FincaAppDomain.Enums;

namespace FincaAppDomain.Entities;

public class Animal : BaseEntity
{
    public Guid FincaActualId { get; private set; }

    public string NumeroArete { get; private set; } = string.Empty;

    public TipoAnimal Tipo { get; private set; }
    public PropositoAnimal Proposito { get; private set; }

    public DateTime FechaNacimiento { get; private set; }

    public Guid? MadreId { get; private set; }
    public Guid? PadreId { get; private set; }

    public bool Activo { get; private set; } = true;

    public EstadoHembra? EstadoActualHembra { get; private set; }
    public EstadoMacho? EstadoActualMacho { get; private set; }

    private Animal() { }

    public Animal(
        string numeroArete,
        TipoAnimal tipo,
        PropositoAnimal proposito,
        DateTime fechaNacimiento,
        Guid fincaId,
        Guid? madreId = null,
        Guid? padreId = null)
    {
        NumeroArete = numeroArete;
        Tipo = tipo;
        Proposito = proposito;
        FechaNacimiento = fechaNacimiento;
        FincaActualId = fincaId;
        MadreId = madreId;
        PadreId = padreId;

        if (tipo == TipoAnimal.Hembra)
            EstadoActualHembra = EstadoHembra.Cria;
        else
            EstadoActualMacho = EstadoMacho.Cria;
    }

    public void CambiarEstadoHembra(EstadoHembra nuevoEstado)
    {
        if (Tipo != TipoAnimal.Hembra)
            throw new InvalidOperationException("El animal no es hembra.");

        if (EstadoActualHembra == null)
            throw new InvalidOperationException("Estado actual no definido.");

        if (!EsTransicionHembraValida(EstadoActualHembra.Value, nuevoEstado))
            throw new InvalidOperationException(
                $"Transición inválida de {EstadoActualHembra} a {nuevoEstado}");

        var estadoAnterior = EstadoActualHembra.Value;
        EstadoActualHembra = nuevoEstado;

        AddDomainEvent(new AnimalEstadoCambiadoEvent(
            Id,
            estadoAnterior.ToString(),
            nuevoEstado.ToString()
        ));
    }

    private bool EsTransicionHembraValida(
    EstadoHembra actual,
    EstadoHembra nuevo)
    {
        return (actual, nuevo) switch
        {
            (EstadoHembra.Cria, EstadoHembra.Recria) => true,
            (EstadoHembra.Recria, EstadoHembra.Novilla) => true,
            (EstadoHembra.Novilla, EstadoHembra.Proxima) => true,
            (EstadoHembra.Proxima, EstadoHembra.Parida) => true,
            (EstadoHembra.Parida, EstadoHembra.Escotera) => true,
            (EstadoHembra.Escotera, EstadoHembra.Proxima) => true,
            _ => false
        };
    }

    public void CambiarEstadoMacho(EstadoMacho nuevoEstado)
    {
        if (Tipo != TipoAnimal.Macho)
            throw new InvalidOperationException("El animal no es macho.");

        if (EstadoActualMacho == null)
            throw new InvalidOperationException("Estado actual no definido.");

        if (!EsTransicionMachoValida(EstadoActualMacho.Value, nuevoEstado))
            throw new InvalidOperationException(
                $"Transición inválida de {EstadoActualMacho} a {nuevoEstado}");

        var estadoAnterior = EstadoActualMacho.Value;
        EstadoActualMacho = nuevoEstado;

        AddDomainEvent(new AnimalEstadoCambiadoEvent(
            Id,
            estadoAnterior.ToString(),
            nuevoEstado.ToString()
        ));
    }

    private bool EsTransicionMachoValida(
        EstadoMacho actual,
        EstadoMacho nuevo)
    {
        return (actual, nuevo) switch
        {
            (EstadoMacho.Cria, EstadoMacho.Recria) => true,
            (EstadoMacho.Recria, EstadoMacho.Torete) => true,
            (EstadoMacho.Torete, EstadoMacho.Toro) => true,
            _ => false
        };
    }

    public void MoverAFinca(Guid nuevaFincaId)
    {
        FincaActualId = nuevaFincaId;
    }

    public void Desactivar()
    {
        Activo = false;
    }

    public void CambiarProposito(PropositoAnimal nuevoProposito)
    {
        if (Proposito == nuevoProposito)
            return;

        Proposito = nuevoProposito;
    }
}
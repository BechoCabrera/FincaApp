using System;
using Xunit;
using FincaAppDomain.Entities;
using FincaAppDomain.Enums;

namespace FincaAppTests;

public class AnimalStateTransitionsTests
{
    [Fact]
    public void Hembra_TransicionesValidas_DeberianPermitir()
    {
        var animal = new Animal("A1", TipoAnimal.Hembra, PropositoAnimal.Carne, DateTime.UtcNow.AddMonths(-1), Guid.NewGuid());

        animal.CambiarEstadoHembra(EstadoHembra.Recria);
        animal.CambiarEstadoHembra(EstadoHembra.Novilla);
        animal.CambiarEstadoHembra(EstadoHembra.Proxima);
        animal.CambiarEstadoHembra(EstadoHembra.Parida);
        animal.CambiarEstadoHembra(EstadoHembra.Escotera);
        animal.CambiarEstadoHembra(EstadoHembra.Proxima);
    }

    [Fact]
    public void Hembra_SaltarEstado_DeberiaFallar()
    {
        var animal = new Animal("A2", TipoAnimal.Hembra, PropositoAnimal.Carne, DateTime.UtcNow.AddMonths(-1), Guid.NewGuid());

        Assert.Throws<InvalidOperationException>(() => animal.CambiarEstadoHembra(EstadoHembra.Novilla));
    }

    [Fact]
    public void Macho_TransicionesValidas_DeberianPermitir()
    {
        var animal = new Animal("M1", TipoAnimal.Macho, PropositoAnimal.Carne, DateTime.UtcNow.AddMonths(-1), Guid.NewGuid());

        animal.CambiarEstadoMacho(EstadoMacho.Recria);
        animal.CambiarEstadoMacho(EstadoMacho.Torete);
        animal.CambiarEstadoMacho(EstadoMacho.Toro);
    }

    [Fact]
    public void Macho_SaltarEstado_DeberiaFallar()
    {
        var animal = new Animal("M2", TipoAnimal.Macho, PropositoAnimal.Carne, DateTime.UtcNow.AddMonths(-1), Guid.NewGuid());

        Assert.Throws<InvalidOperationException>(() => animal.CambiarEstadoMacho(EstadoMacho.Toro));
    }

    [Fact]
    public void NoPuedeCambiarEstadoIncorrectoGenero()
    {
        var animal = new Animal("A3", TipoAnimal.Hembra, PropositoAnimal.Carne, DateTime.UtcNow.AddMonths(-1), Guid.NewGuid());

        Assert.Throws<InvalidOperationException>(() => animal.CambiarEstadoMacho(EstadoMacho.Torete));
    }
}

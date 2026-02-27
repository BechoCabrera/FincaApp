using System;
using System.Linq;
using System.Threading.Tasks;
using Xunit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MediatR;
using FincaAppInfrastructure.Data;
using FincaAppDomain.Entities;
using FincaAppDomain.Enums;
using FincaAppInfrastructure.Repositories;
using FincaAppDomain.Interfaces;

namespace FincaAppTests.Integration;

public class ChangeAnimalStateHandlerTests
{
    [Fact]
    public async Task ChangingState_Should_CreateHistorial()
    {
        var services = new ServiceCollection();

        services.AddDbContext<FincaDbContext>(opt =>
            opt.UseInMemoryDatabase("test_db" + Guid.NewGuid()));

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(ChangeAnimalStateHandlerTests).Assembly));

        services.AddScoped<IAnimalRepository, AnimalRepository>();
        services.AddScoped<IAnimalEstadoHistorialRepository, AnimalEstadoHistorialRepository>();

        // Tenant provider fake
        services.AddScoped<FincaAppDomain.Common.ITenantProvider, TestTenantProvider>();

        var provider = services.BuildServiceProvider();

        using var scope = provider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<FincaDbContext>();

        // Crear animal
        var animal = new Animal("T1", TipoAnimal.Hembra, PropositoAnimal.Carne, DateTime.UtcNow.AddYears(-1), Guid.NewGuid());
        await context.Animales.AddAsync(animal);
        await context.SaveChangesAsync();

        // Cambiar estado y persistir
        animal.CambiarEstadoHembra(EstadoHembra.Recria);
        context.Animales.Update(animal);
        await context.SaveChangesAsync();

        // Verificar historial creado
        var historial = await context.AnimalEstados
            .Where(h => h.AnimalId == animal.Id)
            .ToListAsync();

        Assert.Single(historial);
        Assert.Equal("Cria", historial[0].EstadoAnterior);
        Assert.Equal("Recria", historial[0].EstadoNuevo);
    }
}

public class TestTenantProvider : FincaAppDomain.Common.ITenantProvider
{
    public string TenantId => "test";
}

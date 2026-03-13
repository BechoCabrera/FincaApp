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
using FincaAppApplication.Features.Partos.Commands;
using FincaAppApplication.DTOs.Parto;

namespace FincaAppTests.Integration;

public class RegisterPartoIntegrationTests
{
    [Fact]
    public async Task RegisterParto_Should_Create_Parto_And_Cria_And_Update_Mother_State()
    {
        var services = new ServiceCollection();

        services.AddDbContext<FincaDbContext>(opt =>
            opt.UseInMemoryDatabase("test_db" + Guid.NewGuid()));

        // Register MediatR handlers from application assembly (contains the handler)
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(RegisterPartoCommandHandler).Assembly));

        services.AddScoped<IAnimalRepository, AnimalRepository>();
        services.AddScoped<IPartoRepository, PartoRepository>();
        services.AddScoped<IUnitOfWork, FincaAppInfrastructure.UnitOfWork.EfUnitOfWork>();
        services.AddScoped<IAnimalEstadoHistorialRepository, FincaAppInfrastructure.Repositories.AnimalEstadoHistorialRepository>();
        services.AddScoped<IAnimalMovimientoRepository, AnimalMovimientoRepository>();
        services.AddScoped<IAnimalPalpacionRepository, AnimalPalpacionRepository>();

        // Tenant provider fake
        services.AddScoped<FincaAppDomain.Common.ITenantProvider, TestTenantProvider>();
        services.AddLogging();

        var provider = services.BuildServiceProvider();

        using var scope = provider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<FincaDbContext>();

        // Create mother in Proxima state
        var madre = new Animal("M01", TipoAnimal.Hembra, PropositoAnimal.Carne, DateTime.UtcNow.AddYears(-2), Guid.NewGuid(), "Madre1", null, null, EstadoHembra.Proxima, null);
        await context.Animales.AddAsync(madre);
        await context.SaveChangesAsync();

        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var dto = new CreatePartoRequestDto
        {
            Numero = madre.NumeroArete,
            Nombre = madre.Nombre,
            FincaId = madre.FincaActualId,
            FechaParida = DateTime.UtcNow,
            GeneroCria = "Hembra",
            EstadoHembra = null
        };

        var command = new RegisterPartoCommand { Request = dto };
        var result = await mediator.Send(command);

        // Validate parto and cria created
        var parto = await context.Partos.FindAsync(result.PartoId);
        Assert.NotNull(parto);
        var cria = await context.Animales.FindAsync(result.CriaId);
        Assert.NotNull(cria);

        // Validate parto contains cria snapshot
        Assert.Equal(cria.NumeroArete, parto.CriaNumero);
        Assert.Equal(cria.Nombre, parto.CriaNombre);
        Assert.Equal(cria.Color, parto.CriaColor);
        Assert.Equal(cria.Propietario, parto.CriaPropietario);
        Assert.Equal(cria.PesoKg, parto.CriaPesoKg);
        Assert.Equal(cria.Detalles, parto.CriaDetalles);

        // Validate mother state transitioned to Parida
        var madreDb = await context.Animales.FindAsync(madre.Id);
        Assert.Equal(EstadoHembra.Parida, madreDb.EstadoActualHembra);

        // Validate historial entry created
        var historial = await context.AnimalEstados.Where(h => h.AnimalId == madre.Id).ToListAsync();
        Assert.Contains(historial, h => h.EstadoAnterior == "Proxima" && h.EstadoNuevo == "Parida");

        // Validate movimiento for cria created
        var movimientos = await context.AnimalMovimientos.Where(m => m.AnimalId == result.CriaId).ToListAsync();
        Assert.NotEmpty(movimientos);
        Assert.Contains(movimientos, m => m.FincaDestinoId == madre.FincaActualId);
    }

    [Fact]
    public async Task RegisterParto_Should_Return_Warnings_When_State_Transition_Invalid()
    {
        var services = new ServiceCollection();

        services.AddDbContext<FincaDbContext>(opt =>
            opt.UseInMemoryDatabase("test_db" + Guid.NewGuid()));

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(RegisterPartoCommandHandler).Assembly));

        services.AddScoped<IAnimalRepository, AnimalRepository>();
        services.AddScoped<IPartoRepository, PartoRepository>();
        services.AddScoped<IUnitOfWork, FincaAppInfrastructure.UnitOfWork.EfUnitOfWork>();
        services.AddScoped<IAnimalEstadoHistorialRepository, FincaAppInfrastructure.Repositories.AnimalEstadoHistorialRepository>();
        services.AddScoped<IAnimalMovimientoRepository, AnimalMovimientoRepository>();
        services.AddScoped<IAnimalPalpacionRepository, AnimalPalpacionRepository>();

        // Tenant provider fake
        services.AddScoped<FincaAppDomain.Common.ITenantProvider, TestTenantProvider>();
        services.AddLogging();

        var provider = services.BuildServiceProvider();

        using var scope = provider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<FincaDbContext>();

        // Create mother in Cria state
        var madre = new Animal("M02", TipoAnimal.Hembra, PropositoAnimal.Carne, DateTime.UtcNow.AddYears(-1), Guid.NewGuid(), "Madre2", null, null, EstadoHembra.Cria, null);
        await context.Animales.AddAsync(madre);
        await context.SaveChangesAsync();

        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var dto = new CreatePartoRequestDto
        {
            Numero = madre.NumeroArete,
            Nombre = madre.Nombre,
            FincaId = madre.FincaActualId,
            FechaParida = DateTime.UtcNow,
            GeneroCria = "Hembra",
            EstadoHembra = (int)EstadoHembra.Parida
        };

        var command = new RegisterPartoCommand { Request = dto };

        var result = await mediator.Send(command);

        // Handler should return warnings
        Assert.NotNull(result);
        Assert.NotEmpty(result.Warnings);

        // Ensure mother state unchanged
        var madreDb = await context.Animales.FindAsync(madre.Id);
        Assert.Equal(EstadoHembra.Cria, madreDb.EstadoActualHembra);
    }

    [Fact]
    public async Task RegisterParto_Should_Create_Palpacion_When_FechaPalpacion_Provided()
    {
        var services = new ServiceCollection();

        services.AddDbContext<FincaDbContext>(opt =>
            opt.UseInMemoryDatabase("test_db" + Guid.NewGuid()));

        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(RegisterPartoCommandHandler).Assembly));

        services.AddScoped<IAnimalRepository, AnimalRepository>();
        services.AddScoped<IPartoRepository, PartoRepository>();
        services.AddScoped<IUnitOfWork, FincaAppInfrastructure.UnitOfWork.EfUnitOfWork>();
        services.AddScoped<IAnimalEstadoHistorialRepository, FincaAppInfrastructure.Repositories.AnimalEstadoHistorialRepository>();
        services.AddScoped<IAnimalMovimientoRepository, AnimalMovimientoRepository>();
        services.AddScoped<IAnimalPalpacionRepository, AnimalPalpacionRepository>();

        // Tenant provider fake
        services.AddScoped<FincaAppDomain.Common.ITenantProvider, TestTenantProvider>();
        services.AddLogging();

        var provider = services.BuildServiceProvider();

        using var scope = provider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<FincaDbContext>();

        // Create mother
        var madre = new Animal("M03", TipoAnimal.Hembra, PropositoAnimal.Carne, DateTime.UtcNow.AddYears(-3), Guid.NewGuid(), "Madre3", null, null, EstadoHembra.Proxima, null);
        await context.Animales.AddAsync(madre);
        await context.SaveChangesAsync();

        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var fechaPalp = DateTime.UtcNow.AddDays(-10);

        var dto = new CreatePartoRequestDto
        {
            Numero = madre.NumeroArete,
            Nombre = madre.Nombre,
            FincaId = madre.FincaActualId,
            FechaParida = DateTime.UtcNow,
            FechaPalpacion = fechaPalp,
            GeneroCria = "Macho",
            EstadoHembra = null
        };

        var command = new RegisterPartoCommand { Request = dto };
        var result = await mediator.Send(command);

        // Validate parto and cria created
        var parto = await context.Partos.FindAsync(result.PartoId);
        Assert.NotNull(parto);
        var cria = await context.Animales.FindAsync(result.CriaId);
        Assert.NotNull(cria);

        // Validate palpacion created for mother
        var palpaciones = await context.Set<AnimalPalpacion>().Where(p => p.AnimalId == madre.Id).ToListAsync();
        Assert.NotEmpty(palpaciones);
        Assert.Contains(palpaciones, p => p.FechaPalpacion == fechaPalp);

        // Validate movimiento for cria created
        var movimientos = await context.AnimalMovimientos.Where(m => m.AnimalId == result.CriaId).ToListAsync();
        Assert.NotEmpty(movimientos);
    }
}

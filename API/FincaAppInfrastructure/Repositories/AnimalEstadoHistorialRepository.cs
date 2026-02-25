using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;


namespace FincaAppInfrastructure.Repositories;
public class AnimalEstadoHistorialRepository
    : IAnimalEstadoHistorialRepository
{
    private readonly FincaDbContext _context;

    public AnimalEstadoHistorialRepository(FincaDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(AnimalEstadoHistorial historial)
    {
        await _context.AnimalEstados.AddAsync(historial);
    }
}
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FincaAppInfrastructure.Repositories;

public class AnimalRepository : IAnimalRepository
{
    private readonly FincaDbContext _context;

    public AnimalRepository(FincaDbContext context)
    {
        _context = context;
    }

    public async Task<Animal?> GetByIdAsync(Guid id)
        => await _context.Animales.FirstOrDefaultAsync(x => x.Id == id);

    public async Task<Animal?> GetByNumeroAreteAsync(string numeroArete)
        => await _context.Animales
            .FirstOrDefaultAsync(x => x.NumeroArete == numeroArete);

    public async Task<List<Animal>> GetByFincaAsync(Guid fincaId)
        => await _context.Animales
            .Where(x => x.FincaActualId == fincaId)
            .ToListAsync();

    public async Task AddAsync(Animal animal)
    {
        await _context.Animales.AddAsync(animal);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Animal animal)
    {
        _context.Animales.Update(animal);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> ExistsNumeroAreteAsync(string numeroArete)
        => await _context.Animales
            .AnyAsync(x => x.NumeroArete == numeroArete);
}
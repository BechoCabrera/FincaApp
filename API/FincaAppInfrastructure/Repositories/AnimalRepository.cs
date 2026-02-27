using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;
using FincaAppDomain.Enums;

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

    public async Task<List<Animal>> GetAllAsync(
        TipoAnimal? tipo = null,
        PropositoAnimal? proposito = null,
        string? estado = null,
        int page = 1,
        int pageSize = 20)
    {
        var query = _context.Animales.AsQueryable();

        if (tipo.HasValue)
            query = query.Where(x => x.Tipo == tipo.Value);

        if (proposito.HasValue)
            query = query.Where(x => x.Proposito == proposito.Value);

        if (!string.IsNullOrWhiteSpace(estado))
        {
            query = query.Where(x =>
                (x.EstadoActualHembra != null && x.EstadoActualHembra.ToString() == estado) ||
                (x.EstadoActualMacho != null && x.EstadoActualMacho.ToString() == estado));
        }

        query = query
            .OrderBy(x => x.NumeroArete)
            .Skip((page - 1) * pageSize)
            .Take(pageSize);

        return await query.ToListAsync();
    }
}
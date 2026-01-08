using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FincaAppInfrastructure.Repositories;

public class FincaRepository : IFincaRepository
{
    private readonly FincaDbContext _context;

    public FincaRepository(FincaDbContext context)
    {
        _context = context;
    }

    public async Task<Finca> AddAsync(Finca finca)
    {
        _context.Fincas.Add(finca);
        await _context.SaveChangesAsync();
        return finca;
    }

    public Task<Finca?> GetByIdAsync(Guid id)
        => _context.Fincas.FirstOrDefaultAsync(x => x.Id == id);

    public async Task<List<Finca>> GetAllAsync()
        => await _context.Fincas            
            .OrderBy(x => x.Nombre)
            .ToListAsync();

    public async Task<Finca> UpdateAsync(Finca finca)
    {
        _context.Fincas.Update(finca);
        await _context.SaveChangesAsync();
        return finca;
    }

    public async Task DeleteAsync(Guid id)
    {
        var finca = await _context.Fincas
            .IgnoreQueryFilters() // 🔑 por si usas multitenancy / IsActive
            .FirstOrDefaultAsync(x => x.Id == id);

        if (finca == null)
            return;

        _context.Fincas.Remove(finca);
        await _context.SaveChangesAsync();
    }

}

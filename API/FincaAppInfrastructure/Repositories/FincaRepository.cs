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

    public async Task<Finca?> GetByIdAsync(Guid id)
        => await _context.Fincas.FirstOrDefaultAsync(x => x.Id == id);

    public async Task<List<Finca>> GetAllAsync()
        => await _context.Fincas.ToListAsync();

    public async Task AddAsync(Finca finca)
    {
        await _context.Fincas.AddAsync(finca);
        await _context.SaveChangesAsync();
    }
}
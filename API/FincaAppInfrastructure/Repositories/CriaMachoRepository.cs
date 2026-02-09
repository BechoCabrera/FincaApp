using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FincaAppInfrastructure.Repositories
{
    public class CriaMachoRepository : ICriaMachoRepository
    {
        private readonly FincaDbContext _context;

        public CriaMachoRepository(FincaDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(CriaMacho entity, CancellationToken ct)
        {
            await _context.CriasMachos.AddAsync(entity, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task UpdateAsync(CriaMacho entity, CancellationToken ct)
        {
            _context.CriasMachos.Update(entity);
            await _context.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(CriaMacho entity, CancellationToken ct)
        {
            _context.CriasMachos.Remove(entity);
            await _context.SaveChangesAsync(ct);
        }

        public async Task<CriaMacho?> GetByIdAsync(Guid id, CancellationToken ct)
        {
            return await _context.CriasMachos.FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task<List<CriaMacho>> GetAllAsync(CancellationToken ct)
        {
            return await _context.CriasMachos.ToListAsync(ct);
        }
    }
}

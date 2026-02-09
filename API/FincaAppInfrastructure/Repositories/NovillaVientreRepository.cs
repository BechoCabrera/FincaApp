using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FincaAppInfrastructure.Repositories
{
    public class NovillaVientreRepository : INovillaVientreRepository
    {
        private readonly FincaDbContext _context;

        public NovillaVientreRepository(FincaDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(NovillaVientre entity, CancellationToken ct)
        {
            await _context.NovillasVientre.AddAsync(entity, ct);
            await _context.SaveChangesAsync(ct);
        }

        public async Task UpdateAsync(NovillaVientre entity, CancellationToken ct)
        {
            _context.NovillasVientre.Update(entity);
            await _context.SaveChangesAsync(ct);
        }

        public async Task DeleteAsync(NovillaVientre entity, CancellationToken ct)
        {
            _context.NovillasVientre.Remove(entity);
            await _context.SaveChangesAsync(ct);
        }

        public async Task<NovillaVientre?> GetByIdAsync(Guid id, CancellationToken ct)
        {
            return await _context.NovillasVientre.FirstOrDefaultAsync(x => x.Id == id, ct);
        }

        public async Task<List<NovillaVientre>> GetAllAsync(CancellationToken ct)
        {
            return await _context.NovillasVientre.ToListAsync(ct);
        }
    }
}

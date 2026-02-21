using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FincaAppInfrastructure.Repositories
{
    public class FallecidaRepository : IFallecidaRepository
    {
        private readonly FincaDbContext _context;

        public FallecidaRepository(FincaDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Fallecida fallecida, CancellationToken cancellationToken)
        {
            await _context.Fallecidas.AddAsync(fallecida, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<List<Fallecida>> GetAllByTenantAsync(Guid fincaId, CancellationToken cancellationToken)
        {
            return await _context.Fallecidas
                .Where(f => f.TenantId == fincaId.ToString())
                .ToListAsync(cancellationToken);
        }

        public async Task<Fallecida?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            return await _context.Fallecidas.FindAsync(new object[] { id }, cancellationToken);
        }

        public async Task UpdateAsync(Fallecida fallecida, CancellationToken cancellationToken)
        {
            _context.Fallecidas.Update(fallecida);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(Fallecida fallecida, CancellationToken cancellationToken)
        {
            _context.Fallecidas.Remove(fallecida);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

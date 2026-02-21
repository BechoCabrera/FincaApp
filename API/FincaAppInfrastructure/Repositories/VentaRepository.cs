using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FincaAppInfrastructure.Repositories
{

    public class VentaRepository : IVentaRepository
    {
        private readonly FincaDbContext _context;

        public VentaRepository(FincaDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Venta venta, CancellationToken cancellationToken)
        {
            await _context.Ventas.AddAsync(venta, cancellationToken);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<List<Venta>> GetAllByTenantAsync(Guid fincaId, CancellationToken cancellationToken)
        {
            return await _context.Ventas
                .AsNoTracking()
                .OrderByDescending(v => v.FechaVenta)
                .ToListAsync(cancellationToken);
        }

        public async Task<Venta?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        {
            return await _context.Ventas
                .AsNoTracking()
                .FirstOrDefaultAsync(v => v.Id == id, cancellationToken);
        }

        public async Task UpdateAsync(Venta venta, CancellationToken cancellationToken)
        {
            _context.Ventas.Update(venta);
            await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteAsync(Venta venta, CancellationToken cancellationToken)
        {
            _context.Ventas.Remove(venta);
            await _context.SaveChangesAsync(cancellationToken);
        }
    }
}

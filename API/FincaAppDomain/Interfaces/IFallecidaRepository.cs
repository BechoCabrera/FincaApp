using FincaAppDomain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppDomain.Interfaces
{
    public interface IFallecidaRepository
    {
        Task AddAsync(Fallecida fallecida, CancellationToken cancellationToken);
        Task<List<Fallecida>> GetAllByTenantAsync(Guid fincaId, CancellationToken cancellationToken);
        Task<Fallecida?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
        Task UpdateAsync(Fallecida fallecida, CancellationToken cancellationToken);
        Task DeleteAsync(Fallecida fallecida, CancellationToken cancellationToken);
    }
}

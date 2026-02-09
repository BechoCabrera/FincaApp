using FincaAppDomain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppDomain.Interfaces
{
    public interface ICriaMachoRepository
    {
        Task AddAsync(CriaMacho entity, CancellationToken ct);
        Task UpdateAsync(CriaMacho entity, CancellationToken ct);
        Task DeleteAsync(CriaMacho entity, CancellationToken ct);
        Task<CriaMacho?> GetByIdAsync(Guid id, CancellationToken ct);
        Task<List<CriaMacho>> GetAllAsync(CancellationToken ct);
    }
}

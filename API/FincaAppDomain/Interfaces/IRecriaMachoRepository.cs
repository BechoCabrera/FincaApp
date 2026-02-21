using FincaAppDomain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppDomain.Interfaces
{
    public interface IRecriaMachoRepository
    {
        Task AddAsync(RecriaMacho entity, CancellationToken cancellationToken);
        Task<RecriaMacho?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
        Task<IReadOnlyList<RecriaMacho>> SearchAsync(string? nombre, CancellationToken cancellationToken);
        Task UpdateAsync(RecriaMacho entity, CancellationToken cancellationToken);
        Task DeleteAsync(Guid id, CancellationToken cancellationToken);
    }
}

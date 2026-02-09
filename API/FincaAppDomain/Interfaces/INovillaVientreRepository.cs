using FincaAppDomain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppDomain.Interfaces
{
    public interface INovillaVientreRepository
    {
        Task AddAsync(NovillaVientre entity, CancellationToken ct);
        Task UpdateAsync(NovillaVientre entity, CancellationToken ct);
        Task DeleteAsync(NovillaVientre entity, CancellationToken ct);
        Task<NovillaVientre?> GetByIdAsync(Guid id, CancellationToken ct);
        Task<List<NovillaVientre>> GetAllAsync(CancellationToken ct);
    }
}

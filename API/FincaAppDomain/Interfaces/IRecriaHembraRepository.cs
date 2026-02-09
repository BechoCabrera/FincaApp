using FincaAppDomain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppDomain.Interfaces
{
    public interface IRecriaHembraRepository
    {
        Task AddAsync(RecriaHembra entity, CancellationToken ct);
        Task UpdateAsync(RecriaHembra entity, CancellationToken ct);
        Task DeleteAsync(RecriaHembra entity, CancellationToken ct);
        Task<RecriaHembra?> GetByIdAsync(Guid id, CancellationToken ct);
        Task<List<RecriaHembra>> GetAllAsync(CancellationToken ct);
    }
}

using FincaAppDomain.Entities;

namespace FincaAppDomain.Interfaces
{
    public interface IFincaRepository
    {
        Task<Finca> AddAsync(Finca finca);
        Task<Finca?> GetByIdAsync(Guid id);
        Task<List<Finca>> GetAllAsync();
        Task<Finca> UpdateAsync(Finca finca);
        Task DeleteAsync(Guid id);
    }
}

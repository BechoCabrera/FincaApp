using FincaAppApi.Domain.Entities;

namespace FincaAppApi.Domain.Interfaces
{
    public interface IToroRepository
    {
        Task<Toro> AddAsync(Toro toro);
        Task<Toro> GetByIdAsync(Guid id);
        Task<IEnumerable<Toro>> GetAllAsync();
        Task<Toro> UpdateAsync(Toro toro);
        Task DeleteAsync(Guid id);
        Task <List<Toro>> SearchAsync(string? nombre, string? numero);
    }
}

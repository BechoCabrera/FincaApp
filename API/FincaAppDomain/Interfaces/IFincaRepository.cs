using FincaAppDomain.Entities;

namespace FincaAppDomain.Interfaces;

public interface IFincaRepository
{
    Task<Finca?> GetByIdAsync(Guid id);
    Task<List<Finca>> GetAllAsync();

    Task AddAsync(Finca finca);
}
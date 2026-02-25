using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace FincaAppInfrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly FincaDbContext _context;

    public UsuarioRepository(FincaDbContext context)
    {
        _context = context;
    }

    public async Task<Usuario?> GetByIdAsync(Guid id)
        => await _context.Usuarios.FirstOrDefaultAsync(x => x.Id == id);

    public async Task<Usuario?> GetByEmailAsync(string email)
        => await _context.Usuarios
            .FirstOrDefaultAsync(x => x.Email == email);
}
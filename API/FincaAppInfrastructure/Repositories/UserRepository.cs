using Microsoft.EntityFrameworkCore;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;

namespace FincaAppInfrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly FincaDbContext _context;

    public UserRepository(FincaDbContext context)
    {
        _context = context;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Include(u => u.UserTenants)
            .FirstOrDefaultAsync(u => u.Email == email);
    }
}

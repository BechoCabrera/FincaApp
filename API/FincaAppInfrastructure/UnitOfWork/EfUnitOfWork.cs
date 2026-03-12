using FincaAppInfrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using System;
using System.Threading.Tasks;
using FincaAppDomain.Interfaces;

namespace FincaAppInfrastructure.UnitOfWork;

public class EfUnitOfWork : IUnitOfWork
{
    private readonly FincaDbContext _context;

    public EfUnitOfWork(FincaDbContext context)
    {
        _context = context;
    }

    public async Task<T> ExecuteAsync<T>(Func<Task<T>> action)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            var result = await action();
            await _context.SaveChangesAsync();
            await tx.CommitAsync();
            return result;
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }

    public async Task ExecuteAsync(Func<Task> action)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();
        try
        {
            await action();
            await _context.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch
        {
            await tx.RollbackAsync();
            throw;
        }
    }
}

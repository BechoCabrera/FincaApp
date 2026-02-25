using AutoMapper;
using FincaAppApi.Middleware;
using FincaAppApi.Tenancy;
using FincaAppDomain.Common;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Data;
using FincaAppInfrastructure.Repositories;
using FincaAppInfrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System.Text.Json;

var builder = WebApplication.CreateBuilder(args);

// ===============================
// EF Core
// ===============================

builder.Services.AddDbContext<FincaDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ===============================
// AutoMapper (escanea Application)
// ===============================
builder.Services.AddAutoMapper(typeof(FincaAppApplication.DTOs.Animal.AnimalDto));
builder.Services.AddAutoMapper(typeof(FincaAppApplication.Mappings.AnimalProfile));

// ===============================
// MediatR
// ===============================

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(FincaAppApplication.Features.Animals.Commands.CreateAnimalCommand).Assembly));

// ===============================
// Repositories
// ===============================

builder.Services.AddScoped<IAnimalRepository, AnimalRepository>();
builder.Services.AddScoped<IFincaRepository, FincaRepository>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IAnimalEstadoHistorialRepository, AnimalEstadoHistorialRepository>();

// ===============================
// Seguridad
// ===============================

builder.Services.AddScoped<IJwtProvider, JwtProvider>();

// ===============================
// Multi-Tenancy
// ===============================

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITenantProvider, HttpTenantProvider>();

// ===============================
// Controllers
// ===============================

builder.Services.AddControllers()
    .AddJsonOptions(o =>
    {
        o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// ===============================
// Swagger
// ===============================

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FincaApp API",
        Version = "v1"
    });
});

// ===============================
// CORS
// ===============================

builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("DevCors");
app.UseHttpsRedirection();

app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthorization();

app.MapControllers();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FincaApp API v1");
});

app.Run();
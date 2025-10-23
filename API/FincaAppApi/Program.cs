using AutoMapper;
using FincaAppApi.Tenancy;
using FincaAppApplication.Mappers;      // ToroProfile
using FincaAppDomain.Interfaces;        // IToroRepository
using FincaAppInfrastructure.Data;      // FincaDbContext
using FincaAppInfrastructure.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;


var builder = WebApplication.CreateBuilder(args);

// EF Core
builder.Services.AddDbContext<FincaDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ===== AutoMapper (registro MANUAL, completo) =====
var cfgExp = new AutoMapper.MapperConfigurationExpression();
cfgExp.AddMaps(typeof(ToroProfile).Assembly);   // escanea Profiles en Application

var mapperConfig = new AutoMapper.MapperConfiguration(cfgExp);

// Registrar ambos servicios
builder.Services.AddSingleton<AutoMapper.IConfigurationProvider>(mapperConfig);
builder.Services.AddSingleton<IMapper>(sp =>
    new Mapper(sp.GetRequiredService<AutoMapper.IConfigurationProvider>(), sp.GetService));

// ===== MediatR (v12) =====
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(ToroProfile).Assembly));

// Repos
builder.Services.AddScoped<IToroRepository, ToroRepository>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "FincaApp API", Version = "v1" });
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITenantProvider, HttpTenantProvider>();


var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "FincaApp API v1"));

app.MapControllers();
app.Run();

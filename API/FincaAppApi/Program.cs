using AutoMapper;
using FincaAppApi.Middleware;
using FincaAppApi.Tenancy;
using FincaAppApplication.Mappers;      // ToroProfile
using FincaAppDomain.Common;
using FincaAppDomain.Interfaces;        // IToroRepository
using FincaAppInfrastructure.Data;      // FincaDbContext
using FincaAppInfrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using FincaAppDomain.Interfaces;
using FincaAppInfrastructure.Repositories;
using FincaAppInfrastructure.Security;
using System.Text.Json;
using FincaAppDomain.Repositories;
using FincaAppInfrastructure.Data.Repositories;

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

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IJwtProvider, JwtProvider>();
// ===== MediatR (v12) =====
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(ToroProfile).Assembly));

// Repos
builder.Services.AddScoped<IToroRepository, ToroRepository>();
builder.Services.AddScoped<IFincaRepository, FincaRepository>();
builder.Services.AddScoped<IParidaRepository, ParidaRepository>();
builder.Services.AddScoped<IEscoteraRepository, EscoteraRepository>();
builder.Services.AddScoped<IProximaRepository, ProximaRepository>();
builder.Services.AddScoped<ICriaHembraRepository, CriaHembraRepository>();
builder.Services.AddScoped<IRecriaHembraRepository, RecriaHembraRepository>();
builder.Services.AddScoped<IRecriaMachoRepository, RecriaMachoRepository>();
builder.Services.AddScoped<INovillaVientreRepository, NovillaVientreRepository>();
builder.Services.AddScoped<INovillaVientreRepository, NovillaVientreRepository>();
builder.Services.AddScoped<ICriaMachoRepository, CriaMachoRepository>();
builder.Services.AddScoped<IVentaRepository, VentaRepository>();
builder.Services.AddScoped<IFallecidaRepository, FallecidaRepository>();




builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "FincaApp API", Version = "v1" });
});

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ITenantProvider, HttpTenantProvider>();

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
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FincaApp API v1"));

app.Run();


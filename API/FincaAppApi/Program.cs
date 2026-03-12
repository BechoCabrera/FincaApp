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
using FincaAppApi.Swagger;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

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
builder.Services.AddAutoMapper(typeof(FincaAppApplication.Mappings.FincaProfile));
builder.Services.AddAutoMapper(typeof(FincaAppApplication.DTOs.Salida.VentaDto));

// ===============================
// MediatR
// ===============================

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(FincaAppApplication.Features.Animals.Commands.CreateOrUpdateAnimalCommand).Assembly));

// ===============================
// Repositories
// ===============================

builder.Services.AddScoped<IAnimalRepository, AnimalRepository>();
builder.Services.AddScoped<IFincaRepository, FincaRepository>();
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IAnimalEstadoHistorialRepository, AnimalEstadoHistorialRepository>();

// ===============================
// Seguridad - JWT
// ===============================

builder.Services.AddScoped<IJwtProvider, JwtProvider>();

var jwtKey = builder.Configuration["Jwt:Key"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
var jwtAudience = builder.Configuration["Jwt:Audience"]!;

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateLifetime = true
    };
});

builder.Services.AddAuthorization();

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

    // Add tenant header parameter to all endpoints in Swagger UI
    c.OperationFilter<AddTenantHeaderOperationFilter>();

    // JWT bearer auth for swagger
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter 'Bearer {token}'",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Type = ReferenceType.SecurityScheme,
            Id = "Bearer"
        }
    };

    c.AddSecurityDefinition("Bearer", securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, new[] { "Bearer" } }
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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FincaApp API v1");
});

app.Run();
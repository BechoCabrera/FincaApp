using FincaAppApi.Data;
using FincaAppApi.Domain.Interfaces;
using FincaAppApi.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;  // Asegúrate de incluir este namespace para Swagger
using FincaAppApi.Application.Features.Mappers;
using Microsoft.Extensions.DependencyInjection;


var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAutoMapper(config =>
{
    config.AddProfile<ToroProfile>();  // Agrega el perfil de AutoMapper
}, typeof(Program).Assembly);
// Obtener la cadena de conexión desde appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Configurar el DbContext con la cadena de conexión
builder.Services.AddDbContext<FincaDbContext>(options =>
    options.UseSqlServer(connectionString));

// Agregar servicios de Swagger
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "FincaApp API", Version = "v1" });
});
builder.Services.AddScoped<IToroRepository, ToroRepository>();
// Otros servicios
builder.Services.AddControllers();

var app = builder.Build();

// Usar Swagger
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FincaApp API v1");
});

app.MapControllers(); // Mapea las rutas de los controladores

app.Run();

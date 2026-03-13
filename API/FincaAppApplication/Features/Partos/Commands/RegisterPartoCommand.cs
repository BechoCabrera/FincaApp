using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using FincaAppApplication.DTOs.Parto;
using FincaAppDomain.Entities;
using FincaAppDomain.Enums;
using FincaAppDomain.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using FincaAppDomain.Interfaces;
using FincaAppDomain.Entities;

namespace FincaAppApplication.Features.Partos.Commands;

public class RegisterPartoResult
{
    public Guid PartoId { get; set; }
    public Guid MadreId { get; set; }
    public Guid CriaId { get; set; }
    public string[] Warnings { get; set; } = Array.Empty<string>();
}

public class RegisterPartoCommand : IRequest<RegisterPartoResult>
{
    public CreatePartoRequestDto Request { get; set; } = default!;
}

public class RegisterPartoCommandHandler : IRequestHandler<RegisterPartoCommand, RegisterPartoResult>
{
    private readonly IAnimalRepository _animalRepository;
    private readonly IPartoRepository _partoRepository;
    private readonly IUnitOfWork _uow;
    private readonly ILogger<RegisterPartoCommandHandler> _logger;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IAnimalMovimientoRepository _movimientoRepository;
    private readonly IAnimalPalpacionRepository _palpacionRepository;

    public RegisterPartoCommandHandler(IAnimalRepository animalRepository, IPartoRepository partoRepository, IUnitOfWork uow, ILogger<RegisterPartoCommandHandler> logger, IHttpContextAccessor httpContextAccessor, IAnimalMovimientoRepository movimientoRepository, IAnimalPalpacionRepository palpacionRepository)
    {
        _animalRepository = animalRepository;
        _partoRepository = partoRepository;
        _uow = uow;
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
        _movimientoRepository = movimientoRepository;
        _palpacionRepository = palpacionRepository;
    }

    public async Task<RegisterPartoResult> Handle(RegisterPartoCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Request;

        return await _uow.ExecuteAsync(async () =>
        {
            var warnings = new System.Collections.Generic.List<string>();

            // extract user id from claims if available
            Guid? usuarioId = null;
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext != null && httpContext.User.Identity != null && httpContext.User.Identity.IsAuthenticated)
            {
                var sub = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? httpContext.User.FindFirst("sub")?.Value;

                if (Guid.TryParse(sub, out var parsed))
                    usuarioId = parsed;
            }

            // Try to find mother by numeroArete
            var madre = await _animalRepository.GetByNumeroAreteAsync(dto.Numero);

            if (madre == null)
            {
                // Create minimal mother record
                var fechaNacMadre = dto.FechaNacimiento ?? DateTime.UtcNow;

                madre = new Animal(
                    dto.Numero,
                    TipoAnimal.Hembra,
                    PropositoAnimal.Leche,
                    fechaNacMadre,
                    dto.FincaId,
                    dto.Nombre ?? string.Empty,
                    null,
                    null,
                    EstadoHembra.Parida,
                    null
                );

                // propagate color/tipoLeche to mother
                madre.SetColor(dto.Color);
                madre.SetTipoLeche(dto.TipoLeche);

                await _animalRepository.AddAsync(madre);
            }
            else
            {
                // update nombre if provided
                if (!string.IsNullOrWhiteSpace(dto.Nombre))
                {
                    madre.SetNombre(dto.Nombre);
                }

                // Propagate color/tipoLeche to mother
                madre.SetColor(dto.Color);
                madre.SetTipoLeche(dto.TipoLeche);

                // If client provided an explicit estado for the hembra, try to apply it
                if (dto.EstadoHembra.HasValue)
                {
                    try
                    {
                        if (Enum.IsDefined(typeof(EstadoHembra), dto.EstadoHembra.Value))
                        {
                            madre.CambiarEstadoHembra((EstadoHembra)dto.EstadoHembra.Value, usuarioId);
                        }
                        else
                        {
                            var msg = $"EstadoHembra value {dto.EstadoHembra.Value} is not defined in enum.";
                            _logger.LogWarning(msg);
                            warnings.Add(msg);
                        }
                    }
                    catch (InvalidOperationException ex)
                    {
                        // Log and collect warning; do not throw to avoid blocking parto registration
                        var msg = $"No se pudo cambiar el estado hembra a {dto.EstadoHembra} para la madre {dto.Numero}: {ex.Message}";
                        _logger.LogWarning(ex, msg);
                        warnings.Add(msg);
                    }
                }
                else
                {
                    // If mother is in Proxima state, transition to Parida (preserve previous behavior)
                    try
                    {
                        if (madre.EstadoActualHembra == EstadoHembra.Proxima)
                        {
                            madre.CambiarEstadoHembra(EstadoHembra.Parida, usuarioId);
                        }
                    }
                    catch (InvalidOperationException ex)
                    {
                        // Log but collect warning instead of silently ignoring
                        var msg = $"Failed to transition mother {dto.Numero} from {madre.EstadoActualHembra} to Parida: {ex.Message}";
                        _logger.LogWarning(ex, msg);
                        warnings.Add(msg);
                    }
                }

                // Persist the modified mother once
                await _animalRepository.UpdateAsync(madre);
            }

            // Create cria (offspring) entity
            var criaTipo = (dto.GeneroCria ?? "Hembra").Equals("Hembra", StringComparison.OrdinalIgnoreCase)
                ? TipoAnimal.Hembra
                : TipoAnimal.Macho;

            // Determine cria fechaNacimiento: prefer DTO fechaNacimiento else fechaParida
            var fechaNacCria = dto.FechaNacimiento ?? dto.FechaParida;

            // Use provided cria number if present, otherwise generate one
            var criaNumero = !string.IsNullOrWhiteSpace(dto.NumeroCria)
                ? dto.NumeroCria!
                : $"{madre.NumeroArete}-C-{DateTime.UtcNow:yyyyMMddHHmmssfff}";

            var cria = new Animal(
                criaNumero,
                criaTipo,
                PropositoAnimal.Leche,
                fechaNacCria,
                dto.FincaId,
                dto.CriaNombre ?? string.Empty,
                madre.Id,
                null
            );

            // set additional cria fields
            cria.SetColor(dto.CriaColor);
            cria.SetPropietario(dto.CriaPropietario);
            cria.SetPesoKg(dto.CriaPesoKg);
            cria.SetDetalles(dto.CriaDetalles);

            await _animalRepository.AddAsync(cria);

            // Register movement for newborn cria (Ingreso/Nacimiento)
            try
            {
                var movimiento = new AnimalMovimiento
                {
                    AnimalId = cria.Id,
                    // Temporarily use finca as origin to avoid FK violations until DB defaults/constraints are cleaned
                    FincaOrigenId = dto.FincaId,
                    FincaDestinoId = dto.FincaId,
                    FechaMovimiento = dto.FechaParida != default ? dto.FechaParida : DateTime.UtcNow,
                    UsuarioId = usuarioId ?? Guid.Empty,
                };

                if (_movimientoRepository != null)
                {
                    await _movimientoRepository.AddAsync(movimiento);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "No se pudo registrar movimiento de la cría");
            }

            // Create parto entity with extended data and link to cria
            var parto = new Parto
            {
                AnimalMadreId = madre.Id,
                CriaId = cria.Id,
                FechaParto = dto.FechaParida,
                FechaPalpacion = dto.FechaPalpacion,
                FechaNacimiento = dto.FechaNacimiento,
                GeneroCria = dto.GeneroCria,
                Color = dto.Color,
                TipoLeche = dto.TipoLeche,
                Procedencia = dto.Procedencia,
                Propietario = dto.Propietario,
                Observaciones = dto.Observaciones,

                // snapshot of cria
                CriaNumero = cria.NumeroArete,
                CriaNombre = cria.Nombre,
                CriaColor = cria.Color,
                CriaPropietario = cria.Propietario,
                CriaPesoKg = cria.PesoKg,
                CriaDetalles = cria.Detalles
            };

            await _partoRepository.AddAsync(parto);

            // If palpacion date provided, create AnimalPalpacion record (if repo exists)
            try
            {
                if (dto.FechaPalpacion.HasValue)
                {
                    var palpacion = new FincaAppDomain.Entities.AnimalPalpacion
                    {
                        AnimalId = madre.Id,
                        FechaPalpacion = dto.FechaPalpacion.Value,
                        UsuarioId = usuarioId ?? Guid.Empty,
                        Notas = dto.Observaciones
                    };

                    if (_palpacionRepository != null)
                    {
                        await _palpacionRepository.AddAsync(palpacion);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "No se pudo guardar la palpación");
            }

            return new RegisterPartoResult
            {
                PartoId = parto.Id,
                MadreId = madre.Id,
                CriaId = cria.Id,
                Warnings = warnings.ToArray()
            };
        });
    }
}

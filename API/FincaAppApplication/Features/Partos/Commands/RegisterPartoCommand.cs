using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using FincaAppApplication.DTOs.Parto;
using FincaAppDomain.Entities;
using FincaAppDomain.Enums;
using FincaAppDomain.Interfaces;

namespace FincaAppApplication.Features.Partos.Commands;

public class RegisterPartoResult
{
    public Guid PartoId { get; set; }
    public Guid MadreId { get; set; }
    public Guid CriaId { get; set; }
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

    public RegisterPartoCommandHandler(IAnimalRepository animalRepository, IPartoRepository partoRepository, IUnitOfWork uow)
    {
        _animalRepository = animalRepository;
        _partoRepository = partoRepository;
        _uow = uow;
    }

    public async Task<RegisterPartoResult> Handle(RegisterPartoCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Request;

        return await _uow.ExecuteAsync(async () =>
        {
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

                await _animalRepository.UpdateAsync(madre);

                // If mother is in Proxima state, transition to Parida
                try
                {
                    if (madre.EstadoActualHembra == EstadoHembra.Proxima)
                    {
                        madre.CambiarEstadoHembra(EstadoHembra.Parida);
                        await _animalRepository.UpdateAsync(madre);
                    }
                }
                catch
                {
                    // ignore invalid transitions silently
                }
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
                Observaciones = dto.Observaciones
            };

            await _partoRepository.AddAsync(parto);

            return new RegisterPartoResult
            {
                PartoId = parto.Id,
                MadreId = madre.Id,
                CriaId = cria.Id
            };
        });
    }
}

using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using AutoMapper;
using FincaAppApplication.DTOs.Animal;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Microsoft.Extensions.Logging;
using FincaAppDomain.Enums;

namespace FincaAppApplication.Features.Animals.Commands;

public class    CreateOrUpdateAnimalCommand : IRequest<AnimalDto>
{
    public CreateAnimalRequestDto Request { get; set; } = default!;
}

public class CreateOrUpdateAnimalCommandHandler : IRequestHandler<CreateOrUpdateAnimalCommand, AnimalDto>
{
    private readonly IAnimalRepository _repository;
    private readonly IMapper _mapper;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ILogger<CreateOrUpdateAnimalCommandHandler> _logger;

    public CreateOrUpdateAnimalCommandHandler(IAnimalRepository repository, IMapper mapper, IHttpContextAccessor httpContextAccessor, ILogger<CreateOrUpdateAnimalCommandHandler> logger)
    {
        _repository = repository;
        _mapper = mapper;
        _httpContextAccessor = httpContextAccessor;
        _logger = logger;
    }

    public async Task<AnimalDto> Handle(CreateOrUpdateAnimalCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Request;

        // If animal exists by NumeroArete, update its finca and keep other properties
        var existing = await _repository.GetByNumeroAreteAsync(dto.NumeroArete);
        if (existing != null)
        {
            // update finca and other mutable properties if any
            existing.MoverAFinca(dto.FincaId);
            // update nombre if provided
            if (!string.IsNullOrWhiteSpace(dto.Nombre))
            {
                existing.SetNombre(dto.Nombre);
            }

            // optionally update proposito
            existing.CambiarProposito(dto.Proposito);

            // Try to apply requested state if provided
            Guid? usuarioId = null;
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext != null && httpContext.User.Identity != null && httpContext.User.Identity.IsAuthenticated)
            {
                var sub = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                    ?? httpContext.User.FindFirst("sub")?.Value;

                if (Guid.TryParse(sub, out var parsed))
                    usuarioId = parsed;
            }

            try
            {
                if (dto.EstadoActualHembra.HasValue && existing.Tipo == TipoAnimal.Hembra)
                {
                    existing.CambiarEstadoHembra(dto.EstadoActualHembra.Value, usuarioId);
                }
                if (dto.EstadoActualMacho.HasValue && existing.Tipo == TipoAnimal.Macho)
                {
                    existing.CambiarEstadoMacho(dto.EstadoActualMacho.Value, usuarioId);
                }
            }
            catch (InvalidOperationException ex)
            {
                // Log and continue to avoid breaking upsert flows
                _logger.LogWarning(ex, "Unable to apply requested state for animal {NumeroArete}", dto.NumeroArete);
            }

            await _repository.UpdateAsync(existing);
            return _mapper.Map<AnimalDto>(existing);
        }

        // otherwise create new
        // Determine initial estado params
        FincaAppDomain.Enums.EstadoHembra? estadoHembra = null;
        FincaAppDomain.Enums.EstadoMacho? estadoMacho = null;
        if (dto.Tipo == TipoAnimal.Hembra && dto.EstadoActualHembra.HasValue)
            estadoHembra = dto.EstadoActualHembra.Value;
        if (dto.Tipo == TipoAnimal.Macho && dto.EstadoActualMacho.HasValue)
            estadoMacho = dto.EstadoActualMacho.Value;

        var animal = new Animal(
            dto.NumeroArete,
            dto.Tipo,
            dto.Proposito,
            dto.FechaNacimiento,
            dto.FincaId,
            dto.Nombre,
            dto.MadreId,
            dto.PadreId,
            estadoHembra,
            estadoMacho
        );

        await _repository.AddAsync(animal);

        return _mapper.Map<AnimalDto>(animal);
    }
}

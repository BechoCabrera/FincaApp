using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using FincaAppDomain.Entities;
using FincaAppDomain.Enums;
using FincaAppDomain.Interfaces;
using FincaAppApplication.Common;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace FincaAppApplication.Features.Animals.Commands
{
    public class ChangeAnimalStateCommand : IRequest<Unit>
    {
        public Guid AnimalId { get; set; }
        public EstadoHembra? NuevoEstadoHembra { get; set; }
        public EstadoMacho? NuevoEstadoMacho { get; set; }
    }

    public class ChangeAnimalStateCommandHandler : IRequestHandler<ChangeAnimalStateCommand, Unit>
    {
        private readonly IAnimalRepository _repository;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public ChangeAnimalStateCommandHandler(IAnimalRepository repository, IHttpContextAccessor httpContextAccessor)
        {
            _repository = repository;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task<Unit> Handle(ChangeAnimalStateCommand request, CancellationToken cancellationToken)
        {
            var animal = await _repository.GetByIdAsync(request.AnimalId)
                ?? throw new BadRequestException("Animal no encontrado");

            // Validate provided state matches animal gender
            if (request.NuevoEstadoHembra.HasValue && request.NuevoEstadoMacho.HasValue)
                throw new BadRequestException("Solo se debe enviar un estado para un género.");

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

            try
            {
                if (request.NuevoEstadoHembra.HasValue)
                {
                    if (animal.Tipo != TipoAnimal.Hembra)
                        throw new BadRequestException("El animal no es hembra.");

                    animal.CambiarEstadoHembra(request.NuevoEstadoHembra.Value, usuarioId);
                }

                if (request.NuevoEstadoMacho.HasValue)
                {
                    if (animal.Tipo != TipoAnimal.Macho)
                        throw new BadRequestException("El animal no es macho.");

                    animal.CambiarEstadoMacho(request.NuevoEstadoMacho.Value, usuarioId);
                }
            }
            catch (InvalidOperationException ex)
            {
                // Domain validation failed -> return friendly error
                throw new BadRequestException(ex.Message);
            }

            await _repository.UpdateAsync(animal);
            return Unit.Value;
        }
    }
}

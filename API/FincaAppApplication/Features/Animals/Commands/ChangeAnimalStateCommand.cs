using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using FincaAppDomain.Entities;
using FincaAppDomain.Enums;
using FincaAppDomain.Interfaces;
using FincaAppApplication.Common;

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

        public ChangeAnimalStateCommandHandler(IAnimalRepository repository)
        {
            _repository = repository;
        }

        public async Task<Unit> Handle(ChangeAnimalStateCommand request, CancellationToken cancellationToken)
        {
            var animal = await _repository.GetByIdAsync(request.AnimalId)
                ?? throw new BadRequestException("Animal no encontrado");

            // Validate provided state matches animal gender
            if (request.NuevoEstadoHembra.HasValue && request.NuevoEstadoMacho.HasValue)
                throw new BadRequestException("Solo se debe enviar un estado para un género.");

            try
            {
                if (request.NuevoEstadoHembra.HasValue)
                {
                    if (animal.Tipo != TipoAnimal.Hembra)
                        throw new BadRequestException("El animal no es hembra.");

                    animal.CambiarEstadoHembra(request.NuevoEstadoHembra.Value);
                }

                if (request.NuevoEstadoMacho.HasValue)
                {
                    if (animal.Tipo != TipoAnimal.Macho)
                        throw new BadRequestException("El animal no es macho.");

                    animal.CambiarEstadoMacho(request.NuevoEstadoMacho.Value);
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

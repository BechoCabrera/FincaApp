using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using AutoMapper;
using FincaAppApplication.DTOs.Animal;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;

namespace FincaAppApplication.Features.Animals.Commands
{
    public class CreateAnimalCommand : IRequest<AnimalDto>
    {
        public CreateAnimalRequestDto Request { get; set; } = default!;
    }

    public class CreateAnimalCommandHandler : IRequestHandler<CreateAnimalCommand, AnimalDto>
    {
        private readonly IAnimalRepository _repository;
        private readonly IMapper _mapper;

        public CreateAnimalCommandHandler(IAnimalRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<AnimalDto> Handle(CreateAnimalCommand request, CancellationToken cancellationToken)
        {
            var dto = request.Request;

            // Verificar número de arete único
            if (await _repository.ExistsNumeroAreteAsync(dto.NumeroArete))
                throw new InvalidOperationException("Ya existe un animal con ese numeroArete.");

            var animal = new Animal(
                dto.NumeroArete,
                dto.Tipo,
                dto.Proposito,
                dto.FechaNacimiento,
                dto.FincaId,
                dto.MadreId,
                dto.PadreId
            );

            await _repository.AddAsync(animal);

            return _mapper.Map<AnimalDto>(animal);
        }
    }
}

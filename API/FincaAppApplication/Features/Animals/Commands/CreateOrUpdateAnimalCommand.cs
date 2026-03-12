using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using AutoMapper;
using FincaAppApplication.DTOs.Animal;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;

namespace FincaAppApplication.Features.Animals.Commands;

public class CreateOrUpdateAnimalCommand : IRequest<AnimalDto>
{
    public CreateAnimalRequestDto Request { get; set; } = default!;
}

public class CreateOrUpdateAnimalCommandHandler : IRequestHandler<CreateOrUpdateAnimalCommand, AnimalDto>
{
    private readonly IAnimalRepository _repository;
    private readonly IMapper _mapper;

    public CreateOrUpdateAnimalCommandHandler(IAnimalRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
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
                // using reflection-like setter via internal method if needed; here class has private setter, so
                // add a helper method to set Nombre (we will add it to domain entity)
                existing.SetNombre(dto.Nombre);
            }

            // optionally update proposito
            existing.CambiarProposito(dto.Proposito);
            await _repository.UpdateAsync(existing);
            return _mapper.Map<AnimalDto>(existing);
        }

        // otherwise create new
        var animal = new Animal(
            dto.NumeroArete,
            dto.Tipo,
            dto.Proposito,
            dto.FechaNacimiento,
            dto.FincaId,
            dto.Nombre,
            dto.MadreId,
            dto.PadreId
        );

        await _repository.AddAsync(animal);

        return _mapper.Map<AnimalDto>(animal);
    }
}

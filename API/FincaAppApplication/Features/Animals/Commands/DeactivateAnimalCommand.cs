using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using FincaAppDomain.Interfaces;

namespace FincaAppApplication.Features.Animals.Commands;

public class DeactivateAnimalCommand : IRequest<Unit>
{
    public Guid AnimalId { get; set; }
}

public class DeactivateAnimalCommandHandler : IRequestHandler<DeactivateAnimalCommand, Unit>
{
    private readonly IAnimalRepository _repository;

    public DeactivateAnimalCommandHandler(IAnimalRepository repository)
    {
        _repository = repository;
    }

    public async Task<Unit> Handle(DeactivateAnimalCommand request, CancellationToken cancellationToken)
    {
        var animal = await _repository.GetByIdAsync(request.AnimalId)
            ?? throw new InvalidOperationException("Animal no encontrado");

        animal.Desactivar();

        await _repository.UpdateAsync(animal);

        return Unit.Value;
    }
}

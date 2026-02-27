using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using FincaAppDomain.Interfaces;

namespace FincaAppApplication.Features.Animals.Commands
{
    public class MoveAnimalCommand : IRequest<Unit>
    {
        public Guid AnimalId { get; set; }
        public Guid NuevaFincaId { get; set; }
    }

    public class MoveAnimalCommandHandler : IRequestHandler<MoveAnimalCommand, Unit>
    {
        private readonly IAnimalRepository _repository;

        public MoveAnimalCommandHandler(IAnimalRepository repository)
        {
            _repository = repository;
        }

        public async Task<Unit> Handle(MoveAnimalCommand request, CancellationToken cancellationToken)
        {
            var animal = await _repository.GetByIdAsync(request.AnimalId)
                ?? throw new InvalidOperationException("Animal no encontrado");

            animal.MoverAFinca(request.NuevaFincaId);

            await _repository.UpdateAsync(animal);

            return Unit.Value;
        }
    }
}

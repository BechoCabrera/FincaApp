using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using FincaAppApplication.DTOs.Animal;
using FincaAppDomain.Interfaces;

namespace FincaAppApplication.Features.Animals.Queries
{
    public class GetAnimalByIdQuery : IRequest<AnimalDto>
    {
        public Guid Id { get; set; }
    }

    public class GetAnimalByIdQueryHandler : IRequestHandler<GetAnimalByIdQuery, AnimalDto>
    {
        private readonly IAnimalRepository _repository;
        private readonly IMapper _mapper;

        public GetAnimalByIdQueryHandler(IAnimalRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<AnimalDto> Handle(GetAnimalByIdQuery request, CancellationToken cancellationToken)
        {
            var animal = await _repository.GetByIdAsync(request.Id)
                ?? throw new InvalidOperationException("Animal no encontrado");

            return _mapper.Map<AnimalDto>(animal);
        }
    }
}

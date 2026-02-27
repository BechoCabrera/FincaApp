using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using AutoMapper;
using FincaAppApplication.DTOs.Animal;
using FincaAppDomain.Enums;
using FincaAppDomain.Interfaces;

namespace FincaAppApplication.Features.Animals.Queries
{
    public class GetAnimalsQuery : IRequest<List<AnimalDto>>
    {
        public TipoAnimal? Tipo { get; set; }
        public PropositoAnimal? Proposito { get; set; }
        public string? Estado { get; set; }

        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class GetAnimalsQueryHandler : IRequestHandler<GetAnimalsQuery, List<AnimalDto>>
    {
        private readonly IAnimalRepository _repository;
        private readonly IMapper _mapper;

        public GetAnimalsQueryHandler(IAnimalRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<List<AnimalDto>> Handle(GetAnimalsQuery request, CancellationToken cancellationToken)
        {
            var animals = await _repository.GetAllAsync(
                request.Tipo,
                request.Proposito,
                request.Estado,
                request.Page,
                request.PageSize);

            return _mapper.Map<List<AnimalDto>>(animals);
        }
    }
}

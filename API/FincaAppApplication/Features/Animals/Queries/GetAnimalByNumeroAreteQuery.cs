using System.Threading;
using System.Threading.Tasks;
using MediatR;
using AutoMapper;
using FincaAppApplication.DTOs.Animal;
using FincaAppDomain.Interfaces;

namespace FincaAppApplication.Features.Animals.Queries;

public class GetAnimalByNumeroAreteQuery : IRequest<AnimalDto?>
{
    public string NumeroArete { get; set; } = string.Empty;
}

public class GetAnimalByNumeroAreteQueryHandler : IRequestHandler<GetAnimalByNumeroAreteQuery, AnimalDto?>
{
    private readonly IAnimalRepository _repository;
    private readonly IMapper _mapper;

    public GetAnimalByNumeroAreteQueryHandler(IAnimalRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<AnimalDto?> Handle(GetAnimalByNumeroAreteQuery request, CancellationToken cancellationToken)
    {
        var animal = await _repository.GetByNumeroAreteAsync(request.NumeroArete);
        if (animal == null) return null;
        return _mapper.Map<AnimalDto>(animal);
    }
}

using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using AutoMapper;
using FincaAppApplication.DTOs.Finca;
using FincaAppDomain.Interfaces;

namespace FincaAppApplication.Features.Fincas.Queries;

public class GetFincasQuery : IRequest<List<FincaDto>>
{
}

public class GetFincasQueryHandler : IRequestHandler<GetFincasQuery, List<FincaDto>>
{
    private readonly IFincaRepository _repository;
    private readonly IMapper _mapper;

    public GetFincasQueryHandler(IFincaRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<List<FincaDto>> Handle(GetFincasQuery request, CancellationToken cancellationToken)
    {
        var fincas = await _repository.GetAllAsync();
        return _mapper.Map<List<FincaDto>>(fincas);
    }
}

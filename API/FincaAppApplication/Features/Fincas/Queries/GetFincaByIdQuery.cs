using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using FincaAppApplication.DTOs.Finca;
using FincaAppDomain.Interfaces;

namespace FincaAppApplication.Features.Fincas.Queries;

public class GetFincaByIdQuery : IRequest<FincaDto>
{
    public Guid Id { get; set; }
}

public class GetFincaByIdQueryHandler : IRequestHandler<GetFincaByIdQuery, FincaDto>
{
    private readonly IFincaRepository _repository;
    private readonly IMapper _mapper;

    public GetFincaByIdQueryHandler(IFincaRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<FincaDto> Handle(GetFincaByIdQuery request, CancellationToken cancellationToken)
    {
        var finca = await _repository.GetByIdAsync(request.Id)
            ?? throw new InvalidOperationException("Finca no encontrada");

        return _mapper.Map<FincaDto>(finca);
    }
}

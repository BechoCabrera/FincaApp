using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using AutoMapper;
using FincaAppApplication.DTOs.Finca;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;

namespace FincaAppApplication.Features.Fincas.Commands;

public class CreateFincaCommand : IRequest<Guid>
{
    public CreateFincaRequestDto Request { get; set; } = default!;
}

public class CreateFincaCommandHandler : IRequestHandler<CreateFincaCommand, Guid>
{
    private readonly IFincaRepository _repository;
    private readonly IMapper _mapper;

    public CreateFincaCommandHandler(IFincaRepository repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<Guid> Handle(CreateFincaCommand request, CancellationToken cancellationToken)
    {
        var dto = request.Request;

        var finca = new Finca
        {
            Codigo = dto.Codigo,
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            IsActive = dto.IsActive
        };

        await _repository.AddAsync(finca);
        return finca.Id;
    }
}

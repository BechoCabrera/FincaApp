using AutoMapper;
using FincaAppApplication.DTOs.CriaMacho;
using FincaAppApplication.Features.Requests.CriaMachoRequest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.CriaMachoHandler
{
    public class GetCriaMachoByIdHandler : IRequestHandler<GetCriaMachoByIdRequest, CriaMachoDto>
    {
        private readonly ICriaMachoRepository _repo;
        private readonly IMapper _mapper;

        public GetCriaMachoByIdHandler(ICriaMachoRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<CriaMachoDto> Handle(GetCriaMachoByIdRequest request, CancellationToken ct)
        {
            var entity = await _repo.GetByIdAsync(request.Id, ct)
                ?? throw new KeyNotFoundException("Cría macho no encontrada.");

            return _mapper.Map<CriaMachoDto>(entity);
        }
    }
}

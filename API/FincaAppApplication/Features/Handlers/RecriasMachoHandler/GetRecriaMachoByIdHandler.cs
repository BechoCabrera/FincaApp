using AutoMapper;
using FincaAppApplication.DTOs.RecriasMacho;
using FincaAppApplication.Features.Requests.CriaMachoRequest;
using FincaAppApplication.Features.Requests.RecriasMachoRequest;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.RecriasMachoHandler
{

    public class GetRecriaMachoByIdHandler : IRequestHandler<GetRecriaMachoByIdRequest, RecriaMachoDto>
    {
        private readonly IRecriaMachoRepository _repo;
        private readonly IMapper _mapper;

        public GetRecriaMachoByIdHandler(IRecriaMachoRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<RecriaMachoDto> Handle(GetRecriaMachoByIdRequest request, CancellationToken ct)
        {
            var entity = await _repo.GetByIdAsync(request.Id, ct);
            if (entity is null)
                throw new KeyNotFoundException("Recría macho no encontrada.");
            return _mapper.Map<RecriaMachoDto>(entity);
        }
    }
}

using AutoMapper;
using FincaAppApplication.DTOs.RecriasMacho;
using FincaAppApplication.Features.Requests.RecriasMachoRequest;
using FincaAppDomain.Entities;
using FincaAppDomain.Interfaces;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FincaAppApplication.Features.Handlers.RecriasMachoHandler
{
    public class CreateRecriaMachoHandler : IRequestHandler<CreateRecriaMachoRequest, RecriaMachoDto>
    {
        private readonly IRecriaMachoRepository _repo;
        private readonly IMapper _mapper;

        public CreateRecriaMachoHandler(IRecriaMachoRepository repo, IMapper mapper)
        {
            _repo = repo;
            _mapper = mapper;
        }

        public async Task<RecriaMachoDto> Handle(CreateRecriaMachoRequest request, CancellationToken ct)
        {
            var entity = _mapper.Map<RecriaMacho>(request);
            await _repo.AddAsync(entity, ct);
            return _mapper.Map<RecriaMachoDto>(entity);
        }
    }
}
